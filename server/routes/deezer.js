const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        console.log('\n--- Deezer Searching for:', q, '---');

        const response = await axios.get(
            `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=15&output=json`,
            { timeout: 8000 }
        );

        if (!response.data?.data) {
            console.log('Deezer: No data property in response');
            return res.json({ success: true, data: [] });
        }

        const tracks = response.data.data.map(track => ({
            id: `deezer_${track.id}`,
            _id: `dz_${track.id}`,
            deezerId: track.id,
            title: track.title,
            artist: { name: track.artist.name },
            album: { title: track.album.title },
            imageUrl: track.album.cover_big || track.album.cover_medium || track.album.cover,
            duration: track.duration,
            previewUrl: track.preview,
            source: 'deezer'
        }));

        console.log(`Deezer found ${tracks.length} results`);
        res.json({ success: true, data: tracks });
    } catch (err) {
        console.error('Deezer error:', err.message);
        res.status(500).json({ success: false, error: err.message, data: [] });
    }
});

// GET /api/deezer/songs/:id
router.get('/songs/:id', async (req, res) => {
    try {
        const id = req.params.id.replace('dz_', '').replace('deezer_', '');
        console.log('Deezer getting info for track:', id);
        const response = await axios.get(`https://api.deezer.com/track/${id}`);
        const track = response.data;
        res.json({
            _id: `dz_${track.id}`,
            id: `deezer_${track.id}`,
            title: track.title,
            artist: { name: track.artist.name },
            imageUrl: track.album.cover_big,
            duration: track.duration,
            previewUrl: track.preview,
            source: 'deezer'
        });
    } catch (err) {
        console.error('Deezer info error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
