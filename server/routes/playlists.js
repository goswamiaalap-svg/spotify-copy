const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/playlists – public playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find({ isPublic: true })
            .populate('owner', 'name')
            .populate({
                path: 'songs',
                populate: [
                    { path: 'artist', select: 'name imageUrl' },
                    { path: 'album', select: 'title imageUrl' }
                ]
            });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/playlists/my – current user's playlists (alias /mine)
router.get('/my', protect, async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user._id })
            .populate('owner', 'name')
            .populate({
                path: 'songs',
                populate: [
                    { path: 'artist', select: 'name imageUrl' },
                    { path: 'album', select: 'title imageUrl' }
                ]
            });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/playlists/mine – current user's playlists
router.get('/mine', protect, async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user._id })
            .populate({
                path: 'songs',
                populate: [
                    { path: 'artist', select: 'name imageUrl' },
                    { path: 'album', select: 'title imageUrl' }
                ]
            });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/playlists/:id
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('owner', 'name')
            .populate({
                path: 'songs',
                populate: [
                    { path: 'artist', select: 'name imageUrl' },
                    { path: 'album', select: 'title imageUrl' }
                ]
            });
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/playlists – create playlist
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, imageUrl, isPublic } = req.body;
        const playlist = await Playlist.create({
            name,
            description,
            imageUrl,
            isPublic: isPublic !== false,
            owner: req.user._id
        });

        // Add to user's playlists
        await User.findByIdAndUpdate(req.user._id, {
            $push: { playlists: playlist._id }
        });

        res.status(201).json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/playlists/:id – update playlist
router.put('/:id', protect, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const { name, description, imageUrl, isPublic } = req.body;
        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        if (imageUrl) playlist.imageUrl = imageUrl;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/playlists/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        await Playlist.findByIdAndDelete(req.params.id);
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { playlists: req.params.id }
        });

        res.json({ message: 'Playlist deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/playlists/:id/songs – add song
router.post('/:id/songs', protect, async (req, res) => {
    try {
        const { songId } = req.body;
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }

        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/playlists/:id/songs/:songId – remove song
router.delete('/:id/songs/:songId', protect, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        playlist.songs = playlist.songs.filter(
            (s) => s.toString() !== req.params.songId
        );
        await playlist.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
