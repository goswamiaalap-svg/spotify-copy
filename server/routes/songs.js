const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/songs – all songs (with optional limit)
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const songs = await Song.find()
            .populate('artist', 'name imageUrl')
            .populate('album', 'title imageUrl')
            .sort({ plays: -1 })
            .limit(limit);
        res.json({ songs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/songs/liked – current user's liked songs (MUST be before /:id)
router.get('/liked', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'likedSongs',
            populate: [
                { path: 'artist', select: 'name imageUrl' },
                { path: 'album', select: 'title imageUrl' }
            ]
        });
        res.json(user.likedSongs || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/songs/recently-played
router.get('/recently-played', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'recentlyPlayed.song',
            populate: [
                { path: 'artist', select: 'name imageUrl' },
                { path: 'album', select: 'title imageUrl' }
            ]
        });
        const songs = (user.recentlyPlayed || []).map((r) => r.song).filter(Boolean);
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/songs/search?q=query
// Searches title, genre, AND artist name (via two-step lookup)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) return res.json({ songs: [] });

        // Find artists whose name matches
        const matchedArtists = await Artist.find({
            name: { $regex: q.trim(), $options: 'i' }
        }).select('_id');
        const artistIds = matchedArtists.map(a => a._id);

        // Build compound query: title OR genre OR artist ref
        const orConditions = [
            { title: { $regex: q.trim(), $options: 'i' } },
            { genre: { $regex: q.trim(), $options: 'i' } },
        ];
        if (artistIds.length > 0) {
            orConditions.push({ artist: { $in: artistIds } });
        }

        const songs = await Song.find({ $or: orConditions })
            .populate('artist', 'name imageUrl')
            .populate('album', 'title imageUrl')
            .sort({ plays: -1 })
            .limit(50);

        res.json({ songs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/songs/genre?name=Hip-Hop – fetch songs by genre (case-insensitive)
router.get('/genre', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name || !name.trim()) return res.json({ songs: [] });
        const songs = await Song.find({ genre: { $regex: name.trim(), $options: 'i' } })
            .populate('artist', 'name imageUrl')
            .populate('album', 'title imageUrl')
            .sort({ plays: -1 })
            .limit(50);
        res.json({ songs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/songs/:id
router.get('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
            .populate('artist', 'name imageUrl')
            .populate('album', 'title imageUrl');
        if (!song) return res.status(404).json({ message: 'Song not found' });
        res.json(song);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/songs/:id/like
router.post('/:id/like', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const songId = req.params.id;
        if (!user.likedSongs.map(String).includes(String(songId))) {
            user.likedSongs.push(songId);
            await user.save();
        }
        res.json({ liked: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/songs/:id/like
router.delete('/:id/like', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.likedSongs = user.likedSongs.filter(
            (id) => String(id) !== String(req.params.id)
        );
        await user.save();
        res.json({ liked: false });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/songs/:id/play – record play + update recently played
router.post('/:id/play', protect, async (req, res) => {
    try {
        await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } });

        const user = await User.findById(req.user._id);
        user.recentlyPlayed = (user.recentlyPlayed || []).filter(
            (r) => r.song.toString() !== req.params.id
        );
        user.recentlyPlayed.unshift({ song: req.params.id, playedAt: new Date() });
        user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
        await user.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
