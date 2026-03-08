const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
        imageUrl: { type: String, default: '' },
        releaseDate: { type: Date, default: Date.now },
        genre: { type: String, default: 'Pop' },
        description: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Album', albumSchema);
