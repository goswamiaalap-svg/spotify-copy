const express = require('express');
const router = express.Router();
const SoundCloud = require('soundcloud-scraper');
const client = new SoundCloud.Client();

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const results = await client.search(q, 'track');
        const tracks = results.slice(0, 10).map(t => ({
            _id: t.id ? `sc_${t.id}` : `sc_${Date.now()}_${Math.random()}`,
            title: t.name || 'Unknown',
            artist: { name: t.author?.name || 'Unknown' },
            imageUrl: t.thumbnail,
            duration: Math.floor((t.duration || 0) / 1000), // in seconds
            source: 'soundcloud',
            url: t.url // web url needed for streaming
        }));
        res.json({ success: true, data: tracks });
    } catch (err) {
        console.error('SoundCloud search error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/stream', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send('No URL provided');

        const song = await client.getSongInfo(url);
        const stream = await song.downloadProgressive();

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');

        stream.pipe(res);
    } catch (err) {
        console.error('SoundCloud stream error:', err.message);
        res.status(500).send('Error streaming SoundCloud');
    }
});

module.exports = router;
