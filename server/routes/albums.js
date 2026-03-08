const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Song = require('../models/Song');

// GET /api/albums
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
        const albums = await Album.find(filter)
            .populate('artist', 'name imageUrl')
            .limit(20);
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/albums/:id
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id)
            .populate('artist', 'name imageUrl')
            .populate({
                path: 'songs',
                populate: { path: 'artist', select: 'name imageUrl' }
            });
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
