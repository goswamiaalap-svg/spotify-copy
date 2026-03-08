const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Song = require('../models/Song');
const Album = require('../models/Album');

// GET /api/artists
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
        const artists = await Artist.find(filter).limit(20);
        res.json(artists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/artists/:id
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });
        res.json(artist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/artists/:id/songs
router.get('/:id/songs', async (req, res) => {
    try {
        const songs = await Song.find({ artist: req.params.id })
            .populate('artist', 'name imageUrl')
            .populate('album', 'title imageUrl')
            .sort({ plays: -1 });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/artists/:id/albums
router.get('/:id/albums', async (req, res) => {
    try {
        const albums = await Album.find({ artist: req.params.id })
            .populate('artist', 'name imageUrl');
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
