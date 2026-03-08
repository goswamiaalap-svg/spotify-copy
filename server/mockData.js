// Mock data used when MongoDB is unavailable
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

// ─── Artists ────────────────────────────────────────────────────────────────
const artists = [
    { _id: 'a1', name: 'Aurora Wave', bio: 'Indie electronic artist from Oslo.', genres: ['Electronic'], monthlyListeners: 4200000, imageUrl: artistImages[0] },
    { _id: 'a2', name: 'The Midnight Echo', bio: 'Synthwave duo creating nostalgic electro-pop.', genres: ['Pop'], monthlyListeners: 3800000, imageUrl: artistImages[1] },
    { _id: 'a3', name: 'Luna Verse', bio: 'R&B and soul singer-songwriter.', genres: ['R&B'], monthlyListeners: 6100000, imageUrl: artistImages[2] },
    { _id: 'a4', name: 'Skyline Protocol', bio: 'Alt-rock band fusing post-punk with ambient textures.', genres: ['Rock'], monthlyListeners: 2900000, imageUrl: artistImages[3] },
    { _id: 'a5', name: 'Prism Beat', bio: 'Hip-hop producer exploring jazz and trap.', genres: ['Hip-Hop'], monthlyListeners: 5500000, imageUrl: artistImages[4] },
    { _id: 'a6', name: 'Samba Sol', bio: 'Latin fusion artist from Bogotá.', genres: ['Latin'], monthlyListeners: 3100000, imageUrl: artistImages[5] },
    { _id: 'a7', name: 'Miles & Oak', bio: 'Modern jazz quartet with a cinematic edge.', genres: ['Jazz'], monthlyListeners: 1800000, imageUrl: artistImages[6] },
    { _id: 'a8', name: 'Voltage Grid', bio: 'Dance & electronic producers from Berlin.', genres: ['Dance/Electronic'], monthlyListeners: 4700000, imageUrl: artistImages[7] },
    { _id: 'a9', name: 'Ember Crown', bio: 'Country-folk storytellers from Nashville.', genres: ['Country'], monthlyListeners: 2200000, imageUrl: artistImages[8] },
    { _id: 'a10', name: 'Iron Veil', bio: 'Heavy metal outfit with progressive tendencies.', genres: ['Metal'], monthlyListeners: 1600000, imageUrl: artistImages[9] },
];

// slim ref helpers (no circular deps)
const artRef = (i) => ({ _id: artists[i]._id, name: artists[i].name, imageUrl: artists[i].imageUrl });
const albRef = (id, title, img) => ({ _id: id, title, imageUrl: img });

// ─── Albums metadata ─────────────────────────────────────────────────────────
const albumsMeta = [
    // idx 0 → Electronic
    { _id: 'al1', title: 'Neon Horizons', artistIdx: 0, imageUrl: covers[0], genre: 'Electronic', description: 'A journey through neon-lit futures.', releaseDate: '2023-01-01' },
    // idx 1 → Pop
    { _id: 'al2', title: 'Echoes of Yesterday', artistIdx: 1, imageUrl: covers[1], genre: 'Pop', description: 'Retro-futuristic pop anthems dripping in nostalgia.', releaseDate: '2023-03-01' },
    // idx 2 → R&B
    { _id: 'al3', title: 'Midnight Bloom', artistIdx: 2, imageUrl: covers[2], genre: 'R&B', description: 'Lush, intimate records about love and longing.', releaseDate: '2023-05-01' },
    // idx 3 → Rock
    { _id: 'al4', title: 'Static Kingdom', artistIdx: 3, imageUrl: covers[3], genre: 'Rock', description: 'Three-minute stories from the edge of the city.', releaseDate: '2023-07-01' },
    // idx 4 → Hip-Hop
    { _id: 'al5', title: 'Frequency', artistIdx: 4, imageUrl: covers[4], genre: 'Hip-Hop', description: 'Where boom-bap meets jazz and the streets breathe.', releaseDate: '2023-09-01' },
    // idx 5 → Latin
    { _id: 'al6', title: 'Fuego Libre', artistIdx: 5, imageUrl: covers[5], genre: 'Latin', description: 'Reggaeton, salsa, and chill tropical vibes.', releaseDate: '2023-02-01' },
    // idx 6 → Jazz
    { _id: 'al7', title: 'Blue Quarter', artistIdx: 6, imageUrl: covers[6], genre: 'Jazz', description: 'Late-night jazz for after-midnight sessions.', releaseDate: '2023-04-01' },
    // idx 7 → Dance/Electronic
    { _id: 'al8', title: 'Grid Pulse', artistIdx: 7, imageUrl: covers[7], genre: 'Dance/Electronic', description: 'Four-on-the-floor anthems for the main stage.', releaseDate: '2023-06-01' },
    // idx 8 → Country
    { _id: 'al9', title: 'Backroad Stories', artistIdx: 8, imageUrl: covers[8], genre: 'Country', description: 'Dusty roads and open skies in song.', releaseDate: '2023-08-01' },
    // idx 9 → Metal
    { _id: 'al10', title: 'Iron Riff', artistIdx: 9, imageUrl: covers[9], genre: 'Metal', description: 'Heavy riffs, complex time signatures, raw energy.', releaseDate: '2023-10-01' },
];

const songData = [
    // Electronic (al1, a1)
    { id: 's1', title: 'Neon Pulse', ai: 0, ali: 0, dur: 187, aui: 0 },
    { id: 's2', title: 'Digital Rain', ai: 0, ali: 0, dur: 203, aui: 1 },
    { id: 's3', title: 'Synthetic Dawn', ai: 0, ali: 0, dur: 224, aui: 2 },
    { id: 's4', title: 'Afterglow', ai: 0, ali: 0, dur: 196, aui: 3 },
    { id: 's5', title: 'Pulse Drive', ai: 0, ali: 0, dur: 211, aui: 4 },
    // Pop (al2, a2)
    { id: 's6', title: 'Retro Drive', ai: 1, ali: 1, dur: 215, aui: 5 },
    { id: 's7', title: 'Summer Static', ai: 1, ali: 1, dur: 198, aui: 6 },
    { id: 's8', title: 'Last Transmission', ai: 1, ali: 1, dur: 241, aui: 7 },
    { id: 's9', title: 'Chrome Hearts', ai: 1, ali: 1, dur: 178, aui: 8 },
    { id: 's10', title: 'Daydream City', ai: 1, ali: 1, dur: 205, aui: 9 },
    // R&B (al3, a3)
    { id: 's11', title: 'Velvet Moon', ai: 2, ali: 2, dur: 209, aui: 10 },
    { id: 's12', title: 'Honey Dusk', ai: 2, ali: 2, dur: 234, aui: 11 },
    { id: 's13', title: 'Late Night Call', ai: 2, ali: 2, dur: 192, aui: 12 },
    { id: 's14', title: 'Bloom', ai: 2, ali: 2, dur: 217, aui: 13 },
    { id: 's15', title: 'Silk & Soul', ai: 2, ali: 2, dur: 199, aui: 14 },
    // Rock (al4, a4)
    { id: 's16', title: 'Static Lines', ai: 3, ali: 3, dur: 205, aui: 15 },
    { id: 's17', title: 'Concrete Angels', ai: 3, ali: 3, dur: 228, aui: 0 },
    { id: 's18', title: 'Signal Fire', ai: 3, ali: 3, dur: 199, aui: 1 },
    { id: 's19', title: 'Kingdom Come', ai: 3, ali: 3, dur: 243, aui: 2 },
    { id: 's20', title: 'Broken Static', ai: 3, ali: 3, dur: 188, aui: 3 },
    // Hip-Hop (al5, a5)
    { id: 's21', title: 'Jazz Circuit', ai: 4, ali: 4, dur: 221, aui: 4 },
    { id: 's22', title: 'Trap Sonata', ai: 4, ali: 4, dur: 207, aui: 5 },
    { id: 's23', title: 'Frequency 808', ai: 4, ali: 4, dur: 195, aui: 6 },
    { id: 's24', title: 'Golden Ratio', ai: 4, ali: 4, dur: 230, aui: 7 },
    { id: 's25', title: 'Boom Bap Logic', ai: 4, ali: 4, dur: 212, aui: 8 },
    // Latin (al6, a6)
    { id: 's26', title: 'La Corriente', ai: 5, ali: 5, dur: 198, aui: 9 },
    { id: 's27', title: 'Fuego Lento', ai: 5, ali: 5, dur: 214, aui: 10 },
    { id: 's28', title: 'Noche Tropical', ai: 5, ali: 5, dur: 225, aui: 11 },
    { id: 's29', title: 'Salsa Break', ai: 5, ali: 5, dur: 190, aui: 12 },
    { id: 's30', title: 'Sol de Verano', ai: 5, ali: 5, dur: 207, aui: 13 },
    // Jazz (al7, a7)
    { id: 's31', title: 'Blue Quarter', ai: 6, ali: 6, dur: 318, aui: 14 },
    { id: 's32', title: 'Minor Keys', ai: 6, ali: 6, dur: 284, aui: 15 },
    { id: 's33', title: 'Uptown Swing', ai: 6, ali: 6, dur: 256, aui: 0 },
    { id: 's34', title: 'After Midnight', ai: 6, ali: 6, dur: 301, aui: 1 },
    { id: 's35', title: 'Bossa Interlude', ai: 6, ali: 6, dur: 238, aui: 2 },
    // Dance/Electronic (al8, a8)
    { id: 's36', title: 'Grid Pulse', ai: 7, ali: 7, dur: 195, aui: 3 },
    { id: 's37', title: 'Strobe Light', ai: 7, ali: 7, dur: 210, aui: 4 },
    { id: 's38', title: 'Drop Zone', ai: 7, ali: 7, dur: 223, aui: 5 },
    { id: 's39', title: 'Bass Reactor', ai: 7, ali: 7, dur: 198, aui: 6 },
    { id: 's40', title: 'Euphoria State', ai: 7, ali: 7, dur: 208, aui: 7 },
    // Country (al9, a9)
    { id: 's41', title: 'Backroad Drive', ai: 8, ali: 8, dur: 214, aui: 8 },
    { id: 's42', title: 'Prairie Wind', ai: 8, ali: 8, dur: 198, aui: 9 },
    { id: 's43', title: 'Sunset Honky-Tonk', ai: 8, ali: 8, dur: 229, aui: 10 },
    { id: 's44', title: 'Campfire Stories', ai: 8, ali: 8, dur: 205, aui: 11 },
    { id: 's45', title: 'Old Dirt Road', ai: 8, ali: 8, dur: 191, aui: 12 },
    // Metal (al10, a10)
    { id: 's46', title: 'Iron Riff', ai: 9, ali: 9, dur: 243, aui: 13 },
    { id: 's47', title: 'Thrash Protocol', ai: 9, ali: 9, dur: 197, aui: 14 },
    { id: 's48', title: 'Void Sector', ai: 9, ali: 9, dur: 258, aui: 15 },
    { id: 's49', title: 'Chromatic Decay', ai: 9, ali: 9, dur: 232, aui: 0 },
    { id: 's50', title: 'Wall of Steel', ai: 9, ali: 9, dur: 216, aui: 1 },
];

// Build songs array (no circular refs)
const songs = songData.map((d) => ({
    _id: d.id,
    title: d.title,
    artist: artRef(d.ai),
    album: albRef(albumsMeta[d.ali]._id, albumsMeta[d.ali].title, albumsMeta[d.ali].imageUrl),
    duration: d.dur,
    audioUrl: audioPool[d.aui],
    imageUrl: albumsMeta[d.ali].imageUrl,
    genre: albumsMeta[d.ali].genre,
    plays: Math.floor(Math.random() * 5000000) + 100000,
    releaseDate: albumsMeta[d.ali].releaseDate,
}));

// Full albums with songs (no back-refs into song objects)
const albums = albumsMeta.map((am, ai) => ({
    _id: am._id,
    title: am.title,
    artist: artRef(am.artistIdx),
    imageUrl: am.imageUrl,
    genre: am.genre,
    description: am.description,
    releaseDate: am.releaseDate,
    songs: songs.filter(s => s.album._id === am._id),
}));

const playlists = [
    {
        _id: 'p1', name: 'Top Hits 2024', description: 'The hottest tracks of the year.',
        isPublic: true, imageUrl: 'https://picsum.photos/seed/playlist1/300/300',
        owner: { _id: 'admin', name: 'Spotify Admin' },
        songs: [songs[0], songs[5], songs[10], songs[15], songs[20], songs[25], songs[30], songs[35]],
    },
    {
        _id: 'p2', name: 'Chill Vibes', description: 'Perfect for late nights and slow mornings.',
        isPublic: true, imageUrl: 'https://picsum.photos/seed/playlist2/300/300',
        owner: { _id: 'admin', name: 'Spotify Admin' },
        songs: [songs[11], songs[12], songs[13], songs[10], songs[1], songs[3], songs[31], songs[34]],
    },
    {
        _id: 'p3', name: 'Electronic Energy', description: 'Bass-heavy bangers to fuel your workout.',
        isPublic: true, imageUrl: 'https://picsum.photos/seed/playlist3/300/300',
        owner: { _id: 'admin', name: 'Spotify Admin' },
        songs: [songs[0], songs[1], songs[2], songs[35], songs[36], songs[37], songs[38], songs[39]],
    },
    {
        _id: 'p4', name: 'Hip-Hop Essentials', description: 'The hardest hitting tracks in hip-hop.',
        isPublic: true, imageUrl: 'https://picsum.photos/seed/playlist4/300/300',
        owner: { _id: 'admin', name: 'Spotify Admin' },
        songs: [songs[20], songs[21], songs[22], songs[23], songs[24]],
    },
    {
        _id: 'p5', name: 'Rock Anthems', description: 'Timeless rock bangers for every mood.',
        isPublic: true, imageUrl: 'https://picsum.photos/seed/playlist5/300/300',
        owner: { _id: 'admin', name: 'Spotify Admin' },
        songs: [songs[15], songs[16], songs[17], songs[18], songs[19]],
    },
];

module.exports = { songs, albums, artists, playlists };
