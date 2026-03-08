const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
        album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
        duration: { type: Number, required: true }, // in seconds
        audioUrl: { type: String, required: true },
        imageUrl: { type: String, default: '' },
        genre: { type: String, default: 'Pop' },
        plays: { type: Number, default: 0 },
        releaseDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);
