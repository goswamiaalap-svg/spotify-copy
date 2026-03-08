const express = require('express');
const router = express.Router();
const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');

// SEARCH YouTube
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: false, data: [] });

        console.log('\n--- YouTube Searching for:', q, '---');

        const result = await ytSearch(q);
        const videos = result.videos
            .slice(0, 15)
            .filter(v => v.seconds > 60 && v.seconds < 600) // filter non-songs or extremely long videos
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
                videoId: v.videoId,
                url: `https://www.youtube.com/watch?v=${v.videoId}`
            }));

        console.log(`YouTube found ${videos.length} results`);
        res.json({ success: true, data: videos });
    } catch (err) {
        console.error('YouTube search error:', err.message);
        res.status(500).json({ success: false, error: err.message, data: [] });
    }
});

// GET AUDIO URL from YouTube video
router.get('/audio-url/:videoId', async (req, res) => {
    try {
        const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoId}`;
        console.log('\n--- Getting audio URL for YouTube:', videoUrl, '---');

        const output = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0'],
        });

        // Get best audio format
        const audioFormats = output.formats
            .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0));

        const bestAudio = audioFormats[0] || output.formats[0];

        if (!bestAudio?.url) {
            console.error('No audio URL found in YouTube formats');
            return res.status(404).json({ error: 'No audio URL found' });
        }

        console.log('Got YouTube audio URL, quality:', bestAudio.abr, 'kbps');
        res.json({
            success: true,
            audioUrl: bestAudio.url,
            title: output.title,
            duration: output.duration,
            imageUrl: output.thumbnail
        });
    } catch (err) {
        console.error('YouTube audio extraction error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
