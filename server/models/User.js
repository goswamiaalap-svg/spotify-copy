const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        imageUrl: { type: String, default: '' },
        likedSongs: [{
            songId: { type: String, required: true },
            title: String,
            artist: String,
            albumArt: String,
            duration: String,
            audioUrl: String,
            likedAt: { type: Date, default: Date.now }
        }],
        playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
        recentlyPlayed: [{
            songId: String,
            title: String,
            artist: String,
            albumArt: String,
            duration: String,
            audioUrl: String,
            playedAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
