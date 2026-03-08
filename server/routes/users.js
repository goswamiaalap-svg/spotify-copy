const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/liked-songs
// @desc    Get user's liked songs
// @access  Private
router.get('/liked-songs', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return sorted by likedAt descending
        const likedSongs = user.likedSongs.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
        res.json(likedSongs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching liked songs' });
    }
});

// @route   POST /api/users/like
// @desc    Toggle like for a song
// @access  Private
router.post('/like', protect, async (req, res) => {
    try {
        const { songId, title, artist, albumArt, duration, audioUrl } = req.body;

        if (!songId) {
            return res.status(400).json({ message: 'songId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingIndex = user.likedSongs.findIndex(s => s.songId === songId);

        if (existingIndex > -1) {
            // Already liked, so remove it
            user.likedSongs.splice(existingIndex, 1);
            await user.save();
            return res.json({ liked: false, message: 'Removed from liked songs' });
        } else {
            // Not liked, so add it
            user.likedSongs.push({
                songId,
                title: title || 'Unknown Title',
                artist: artist || 'Unknown Artist',
                albumArt: albumArt || '',
                duration: duration || '',
                audioUrl: audioUrl || '',
                likedAt: new Date()
            });
            await user.save();
            return res.json({ liked: true, message: 'Added to liked songs' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error toggling like' });
    }
});

module.exports = router;
