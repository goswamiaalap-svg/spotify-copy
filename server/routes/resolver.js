const express = require('express');
const router = express.Router();
const axios = require('axios');
const ytSearch = require('yt-search');

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json({ success: false, data: { saavn: [], youtube: [], deezer: [], soundcloud: [] } });
    }

    console.log('\n========================================');
    console.log('=== RESOLVER SEARCH:', q, '===');
    console.log('========================================');

    const results = {
        saavn: [],
        youtube: [],
        deezer: [],
        soundcloud: []
    };

    // Run ALL searches in parallel with individual error handling
    await Promise.allSettled([
        // 1. JioSaavn (Local API call to our own route to leverage normalization)
        axios.get(`http://localhost:5000/api/jiosaavn/search?q=${encodeURIComponent(q)}&limit=10`)
            .then(r => {
                results.saavn = r.data?.songs || [];
                console.log('✅ JioSaavn found:', results.saavn.length);
            })
            .catch(e => console.log('❌ JioSaavn failed:', e.message)),

        // 2. YouTube
        ytSearch(q)
            .then(r => {
                results.youtube = r.videos
                    .slice(0, 10)
                    .filter(v => v.seconds > 60 && v.seconds < 1200)
                    .map(v => ({
                        id: v.videoId,
                        _id: `yt_${v.videoId}`,
                        title: v.title,
                        artist: { name: v.author.name },
                        album: { title: 'YouTube' },
                        imageUrl: v.thumbnail,
                        duration: v.seconds,
                        durationText: v.timestamp,
                        source: 'youtube',
                        videoId: v.videoId
                    }));
                console.log('✅ YouTube found:', results.youtube.length);
            })
            .catch(e => console.log('❌ YouTube failed:', e.message)),

        // 3. Deezer
        axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`, { timeout: 8000 })
            .then(r => {
                results.deezer = (r.data?.data || []).map(t => ({
                    _id: `dz_${t.id}`,
                    id: `deezer_${t.id}`,
                    title: t.title,
                    artist: { name: t.artist.name },
                    album: { title: t.album.title },
                    imageUrl: t.album.cover_big,
                    duration: t.duration,
                    previewUrl: t.preview,
                    source: 'deezer'
                }));
                console.log('✅ Deezer found:', results.deezer.length);
            })
            .catch(e => console.log('❌ Deezer failed:', e.message)),

        // 4. SoundCloud (Mock or call our local route)
        axios.get(`http://localhost:5000/api/soundcloud/search?q=${encodeURIComponent(q)}`)
            .then(r => {
                results.soundcloud = r.data?.data || [];
                console.log('✅ SoundCloud found:', results.soundcloud.length);
            })
            .catch(e => console.log('❌ SoundCloud failed:', e.message))
    ]);

    const totalResults =
        results.saavn.length +
        results.youtube.length +
        results.deezer.length +
        results.soundcloud.length;

    console.log('Total results found across all platforms:', totalResults);
    res.json({ success: true, data: results, total: totalResults });
});

// Play a specific song by source (Unified Redirector)
router.get('/play/:source/:id', async (req, res) => {
    const { source, id } = req.params;
    console.log(`\n--- Resolver: Redirecting play for [${source}] ID: ${id} ---`);

    try {
        if (source === 'saavn' || source === 'jio') {
            const songId = id.replace('jio_', '');
            const response = await axios.get(`http://localhost:5000/api/jiosaavn/songs/${songId}`);
            return res.json({ url: response.data.audioUrl, source });
        }

        if (source === 'youtube' || source === 'yt') {
            return res.json({
                url: `/api/youtube/audio-url/${id.replace('yt_', '')}`,
                source,
                needsFetch: true
            });
        }

        if (source === 'deezer' || source === 'dz') {
            const trackId = id.replace('dz_', '').replace('deezer_', '');
            const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
            return res.json({ url: response.data.preview, source, isPreview: true });
        }

        if (source === 'soundcloud' || source === 'sc') {
            return res.json({
                url: `/api/soundcloud/stream?url=${encodeURIComponent(id)}`,
                source
            });
        }

        res.status(400).json({ error: 'Unsupported source' });
    } catch (err) {
        console.error('Resolver play error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
