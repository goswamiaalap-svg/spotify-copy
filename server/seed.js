const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Artist = require('./models/Artist');
const Album = require('./models/Album');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spotify-clone';

// ─── Assets ──────────────────────────────────────────────────────────────────
const covers = [
    'https://picsum.photos/seed/album1/300/300',
    'https://picsum.photos/seed/album2/300/300',
    'https://picsum.photos/seed/album3/300/300',
    'https://picsum.photos/seed/album4/300/300',
    'https://picsum.photos/seed/album5/300/300',
    'https://picsum.photos/seed/album6/300/300',
    'https://picsum.photos/seed/album7/300/300',
    'https://picsum.photos/seed/album8/300/300',
    'https://picsum.photos/seed/album9/300/300',
    'https://picsum.photos/seed/album10/300/300',
];

const artistImages = [
    'https://picsum.photos/seed/artist1/400/400',
    'https://picsum.photos/seed/artist2/400/400',
    'https://picsum.photos/seed/artist3/400/400',
    'https://picsum.photos/seed/artist4/400/400',
    'https://picsum.photos/seed/artist5/400/400',
    'https://picsum.photos/seed/artist6/400/400',
    'https://picsum.photos/seed/artist7/400/400',
    'https://picsum.photos/seed/artist8/400/400',
    'https://picsum.photos/seed/artist9/400/400',
    'https://picsum.photos/seed/artist10/400/400',
];

const audioPool = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
];

// ─── Seed function ────────────────────────────────────────────────────────────
async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear
    await Promise.all([
        Artist.deleteMany({}), Album.deleteMany({}),
        Song.deleteMany({}), Playlist.deleteMany({}),
        User.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Artists (one per genre) ─────────────────────────────────────────────
    const artistDefs = [
        { name: 'Aurora Wave', bio: 'Indie electronic artist from Oslo.', genres: ['Electronic'], monthlyListeners: 4200000 },
        { name: 'The Midnight Echo', bio: 'Synthwave duo creating nostalgic pop anthems.', genres: ['Pop'], monthlyListeners: 3800000 },
        { name: 'Luna Verse', bio: 'R&B and soul singer-songwriter.', genres: ['R&B'], monthlyListeners: 6100000 },
        { name: 'Skyline Protocol', bio: 'Alt-rock band fusing post-punk with ambient textures.', genres: ['Rock'], monthlyListeners: 2900000 },
        { name: 'Prism Beat', bio: 'Hip-hop producer exploring jazz and trap.', genres: ['Hip-Hop'], monthlyListeners: 5500000 },
        { name: 'Samba Sol', bio: 'Latin fusion artist from Bogotá.', genres: ['Latin'], monthlyListeners: 3100000 },
        { name: 'Miles & Oak', bio: 'Modern jazz quartet with a cinematic edge.', genres: ['Jazz'], monthlyListeners: 1800000 },
        { name: 'Voltage Grid', bio: 'Dance & electronic producers from Berlin.', genres: ['Dance/Electronic'], monthlyListeners: 4700000 },
        { name: 'Ember Crown', bio: 'Country-folk storytellers from Nashville.', genres: ['Country'], monthlyListeners: 2200000 },
        { name: 'Iron Veil', bio: 'Heavy metal outfit with progressive tendencies.', genres: ['Metal'], monthlyListeners: 1600000 },
    ];

    const artists = await Artist.insertMany(
        artistDefs.map((a, i) => ({ ...a, imageUrl: artistImages[i] }))
    );
    console.log(`🎤 Created ${artists.length} artists`);

    // ── Albums (one per genre/artist) ─────────────────────────────────────
    const albumDefs = [
        { title: 'Neon Horizons', artistIdx: 0, genre: 'Electronic', description: 'A journey through neon-lit futures.' },
        { title: 'Echoes of Yesterday', artistIdx: 1, genre: 'Pop', description: 'Retro-futuristic pop anthems dripping in nostalgia.' },
        { title: 'Midnight Bloom', artistIdx: 2, genre: 'R&B', description: 'Lush, intimate records about love and longing.' },
        { title: 'Static Kingdom', artistIdx: 3, genre: 'Rock', description: 'Three-minute stories from the edge of the city.' },
        { title: 'Frequency', artistIdx: 4, genre: 'Hip-Hop', description: 'Where boom-bap meets jazz and the streets breathe.' },
        { title: 'Fuego Libre', artistIdx: 5, genre: 'Latin', description: 'Reggaeton, salsa, and chill tropical vibes.' },
        { title: 'Blue Quarter', artistIdx: 6, genre: 'Jazz', description: 'Late-night jazz for after-midnight sessions.' },
        { title: 'Grid Pulse', artistIdx: 7, genre: 'Dance/Electronic', description: 'Four-on-the-floor anthems for the main stage.' },
        { title: 'Backroad Stories', artistIdx: 8, genre: 'Country', description: 'Dusty roads and open skies in song.' },
        { title: 'Iron Riff', artistIdx: 9, genre: 'Metal', description: 'Heavy riffs, complex time signatures, raw energy.' },
    ];

    const albums = await Album.insertMany(
        albumDefs.map((a, i) => ({
            title: a.title,
            artist: artists[a.artistIdx]._id,
            imageUrl: covers[i],
            genre: a.genre,
            description: a.description,
            releaseDate: new Date(2023, i * 1.2, 1),
            songs: [],
        }))
    );
    console.log(`💿 Created ${albums.length} albums`);

    // ── Songs (5 per album = 50 total) ────────────────────────────────────
    const songTitles = [
        ['Neon Pulse', 'Digital Rain', 'Synthetic Dawn', 'Afterglow', 'Pulse Drive'],       // Electronic
        ['Retro Drive', 'Summer Static', 'Last Transmission', 'Chrome Hearts', 'Daydream City'],     // Pop
        ['Velvet Moon', 'Honey Dusk', 'Late Night Call', 'Bloom', 'Silk & Soul'],       // R&B
        ['Static Lines', 'Concrete Angels', 'Signal Fire', 'Kingdom Come', 'Broken Static'],     // Rock
        ['Jazz Circuit', 'Trap Sonata', 'Frequency 808', 'Golden Ratio', 'Boom Bap Logic'],    // Hip-Hop
        ['La Corriente', 'Fuego Lento', 'Noche Tropical', 'Salsa Break', 'Sol de Verano'],     // Latin
        ['Blue Quarter', 'Minor Keys', 'Uptown Swing', 'After Midnight', 'Bossa Interlude'],   // Jazz
        ['Grid Pulse', 'Strobe Light', 'Drop Zone', 'Bass Reactor', 'Euphoria State'],    // Dance/Electronic
        ['Backroad Drive', 'Prairie Wind', 'Sunset Honky-Tonk', 'Campfire Stories', 'Old Dirt Road'],     // Country
        ['Iron Riff', 'Thrash Protocol', 'Void Sector', 'Chromatic Decay', 'Wall of Steel'],     // Metal
    ];

    const durations = [
        187, 203, 224, 196, 211,
        215, 198, 241, 178, 205,
        209, 234, 192, 217, 199,
        205, 228, 199, 243, 188,
        221, 207, 195, 230, 212,
        198, 214, 225, 190, 207,
        318, 284, 256, 301, 238,
        195, 210, 223, 198, 208,
        214, 198, 229, 205, 191,
        243, 197, 258, 232, 216,
    ];

    const allSongs = [];
    let songIdx = 0;

    for (let ai = 0; ai < albums.length; ai++) {
        const album = albums[ai];
        const artist = artists[albumDefs[ai].artistIdx];
        const genre = albumDefs[ai].genre;

        for (let ti = 0; ti < songTitles[ai].length; ti++) {
            allSongs.push({
                title: songTitles[ai][ti],
                artist: artist._id,
                album: album._id,
                genre,
                duration: durations[songIdx],
                audioUrl: audioPool[songIdx % audioPool.length],
                imageUrl: covers[ai],
                plays: Math.floor(Math.random() * 5000000) + 100000,
                releaseDate: new Date(2023, ai, ti + 1),
            });
            songIdx++;
        }
    }

    const songs = await Song.insertMany(allSongs);
    console.log(`🎵 Created ${songs.length} songs (5 per genre)`);

    // Update albums with song refs
    let sIdx = 0;
    for (const album of albums) {
        album.songs = songs.slice(sIdx, sIdx + 5).map(s => s._id);
        await album.save();
        sIdx += 5;
    }

    // ── Seed user ──────────────────────────────────────────────────────────
    const seedUser = await User.create({
        name: 'Spotify Admin', email: 'admin@spotify-clone.com', password: 'Admin@123!',
    });

    // ── Playlists ──────────────────────────────────────────────────────────
    await Playlist.insertMany([
        {
            name: 'Top Hits 2024', description: 'The hottest tracks of the year.',
            imageUrl: 'https://picsum.photos/seed/playlist1/300/300',
            owner: seedUser._id, isPublic: true,
            songs: [songs[0], songs[5], songs[10], songs[15], songs[20], songs[25], songs[30], songs[35]].map(s => s._id),
        },
        {
            name: 'Chill Vibes', description: 'Perfect for late nights and slow mornings.',
            imageUrl: 'https://picsum.photos/seed/playlist2/300/300',
            owner: seedUser._id, isPublic: true,
            songs: [songs[11], songs[12], songs[10], songs[1], songs[31], songs[34]].map(s => s._id),
        },
        {
            name: 'Electronic Energy', description: 'Bass-heavy bangers for your workout.',
            imageUrl: 'https://picsum.photos/seed/playlist3/300/300',
            owner: seedUser._id, isPublic: true,
            songs: [songs[0], songs[1], songs[2], songs[35], songs[36], songs[37]].map(s => s._id),
        },
        {
            name: 'Hip-Hop Essentials', description: 'The hardest hitting tracks in hip-hop.',
            imageUrl: 'https://picsum.photos/seed/playlist4/300/300',
            owner: seedUser._id, isPublic: true,
            songs: songs.slice(20, 25).map(s => s._id),
        },
        {
            name: 'Rock Anthems', description: 'Timeless rock bangers for every mood.',
            imageUrl: 'https://picsum.photos/seed/playlist5/300/300',
            owner: seedUser._id, isPublic: true,
            songs: songs.slice(15, 20).map(s => s._id),
        },
    ]);
    console.log('📋 Created 5 playlists');

    console.log('\n✨ Database seeded successfully!');
    console.log('   👤 Demo user: admin@spotify-clone.com / Admin@123!');
    console.log(`   🎵 ${songs.length} songs seeded across 10 genres`);
    mongoose.disconnect();
}

seed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
