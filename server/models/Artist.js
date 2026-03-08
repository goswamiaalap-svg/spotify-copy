const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        bio: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        monthlyListeners: { type: Number, default: 0 },
        genres: [{ type: String }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Artist', artistSchema);
