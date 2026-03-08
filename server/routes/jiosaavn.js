const express = require('express');
const router = express.Router();
const axios = require('axios');

const SAAVN_BASE = 'https://jiosaavn-api-privatecvc2.vercel.app';

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function saavnGet(endpoint) {
    const { data } = await axios.get(`${SAAVN_BASE}${endpoint}`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    });
    return data;
}

// ─── Normalizers ─────────────────────────────────────────────────────────────
function bestImage(arr, fallback = '') {
    if (!Array.isArray(arr) || !arr.length) return fallback;
    const img500 = arr.find(x => x.quality === '500x500');
    if (img500) return img500.url || img500.link;
    return arr[arr.length - 1]?.url || arr[1]?.url || fallback;
}

function bestAudio(arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    const q320 = arr.find(x => x.quality === '320kbps' || x.bitrate === '320' || x.quality === '320');
    if (q320 && (q320.url || q320.link)) return q320.url || q320.link;
    const q160 = arr.find(x => x.quality === '160kbps' || x.bitrate === '160' || x.quality === '160');
    if (q160 && (q160.url || q160.link)) return q160.url || q160.link;
    const q96 = arr.find(x => x.quality === '96kbps' || x.bitrate === '96' || x.quality === '96');
    if (q96 && (q96.url || q96.link)) return q96.url || q96.link;
    return arr[arr.length - 1]?.url || arr[0]?.url || '';
}

function langToGenre(lang) {
    const map = {
        hindi: 'Bollywood',
        english: 'Pop',
        punjabi: 'Punjabi',
        tamil: 'Tamil',
        telugu: 'Telugu',
        kannada: 'Kannada',
        malayalam: 'Malayalam',
        bengali: 'Bengali',
        marathi: 'Marathi',
        gujarati: 'Gujarati',
    };
    return map[(lang || '').toLowerCase()] || 'Bollywood';
}

function decodeHtml(str) {
    if (!str) return '';
    return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");
}

function normalizeSong(s) {
    if (!s?.id) return null;
    const primaryArtist = s.artists?.primary?.[0] || {};
    const artistName = typeof s.primaryArtists === 'string'
        ? s.primaryArtists.split(', ')[0]
        : (primaryArtist.name || 'Unknown');

    return {
        _id: `jio_${s.id}`,
        title: decodeHtml(s.name || s.song || 'Untitled'),
        artist: {
            _id: `jio_artist_${primaryArtist.id || 'unknown'}`,
            name: decodeHtml(artistName),
            imageUrl: bestImage(primaryArtist.image),
        },
        album: {
            _id: `jio_album_${s.album?.id || 'unknown'}`,
            title: decodeHtml(s.album?.name || ''),
            imageUrl: bestImage(s.image),
        },
        imageUrl: bestImage(s.image),
        audioUrl: bestAudio(s.downloadUrl),
        duration: parseInt(s.duration) || 0,
        genre: langToGenre(s.language),
        language: s.language || '',
        plays: parseInt(s.playCount) || 0,
        year: s.year || '',
        explicit: s.explicit || false,
        downloadUrl: s.downloadUrl || [],
        source: 'saavn',
    };
}



function normalizeAlbum(a) {
    if (!a?.id) return null;
    return {
        _id: `jio_${a.id}`,
        title: a.name || 'Unknown Album',
        imageUrl: bestImage(a.image),
        artist: { name: typeof a.primaryArtists === 'string' ? a.primaryArtists : (a.primaryArtists?.[0]?.name || 'Unknown') },
        year: a.year || '',
        songs: Array.isArray(a.songs) ? a.songs.map(normalizeSong).filter(Boolean) : [],
    };
}

function normalizeArtist(a) {
    if (!a?.id) return null;
    return {
        _id: `jio_${a.id}`,
        name: a.name || 'Unknown',
        imageUrl: bestImage(a.image),
        bio: a.bio?.[0]?.text || '',
        followerCount: parseInt(a.followerCount) || 0,
        genres: Array.isArray(a.dominantLanguage) ? [a.dominantLanguage] : [],
    };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/jiosaavn/health
router.get('/health', (_req, res) => res.json({ status: 'ok', source: 'JioSaavn (saavn.dev)' }));

// GET /api/jiosaavn/audio?url=...
router.get('/audio', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send('No URL provided');

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'audio/mpeg');

        const decodedUrl = decodeURIComponent(url);
        if (!decodedUrl.startsWith('http')) return res.status(400).send('Invalid URL');

        const response = await axios({
            method: 'get',
            url: decodedUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        response.data.pipe(res);
    } catch (err) {
        console.error('[JioSaavn] audio proxy error:', err.message);
        res.status(500).send('Error proxying audio');
    }
});

// GET /api/jiosaavn/search?q=arijit+singh&limit=20
router.get('/search', async (req, res) => {
    try {
        const { q = '', limit = 20, page = 1 } = req.query;
        if (!q.trim()) return res.json({ songs: [], albums: [], artists: [] });

        const enc = encodeURIComponent(q.trim());

        const [songsR, albumsR, artistsR] = await Promise.allSettled([
            saavnGet(`/search/songs?query=${enc}&limit=${limit}&page=${page}`),
            saavnGet(`/search/albums?query=${enc}&limit=8`),
            saavnGet(`/search/artists?query=${enc}&limit=6`),
        ]);

        res.json({
            songs: songsR.status === 'fulfilled' ? (songsR.value?.data?.results || []).map(normalizeSong).filter(Boolean) : [],
            albums: albumsR.status === 'fulfilled' ? (albumsR.value?.data?.results || []).map(normalizeAlbum).filter(Boolean) : [],
            artists: artistsR.status === 'fulfilled' ? (artistsR.value?.data?.results || []).map(normalizeArtist).filter(Boolean) : [],
        });
    } catch (err) {
        console.error('[JioSaavn] search error:', err.message);
        res.status(500).json({ message: err.message, songs: [], albums: [], artists: [] });
    }
});

// ─── Curated genre → search-query map ────────────────────────────────────────
const GENRE_QUERIES = {
    'Bollywood': 'Bollywood superhits 2024',
    'Hip-Hop': 'hip hop rap songs 2024',
    'Pop': 'English pop hits 2024',
    'Rock': 'rock music hits',
    'Dance/Electronic': 'EDM electronic dance music 2024',
    'R&B': 'RnB soul music',
    'Latin': 'Latin reggaeton 2024',
    'Jazz': 'jazz music classics',
    'Electronic': 'electronic synth music',
    'Country': 'country music Nashville',
    'Metal': 'heavy metal music',
    'Punjabi': 'Punjabi songs 2024',
    'Romantic': 'Bollywood romantic songs',
    'Tamil': 'Tamil songs kuthu 2024',
    'Telugu': 'Telugu hits 2024',
    'Party': 'party songs dance floor 2024',
    'Devotional': 'bhakti devotional songs',
    'Classical': 'Indian classical music ragas',
    'Workout': 'gym workout motivation songs',
    'Chill': 'lo-fi chill relax music',
};

// GET /api/jiosaavn/home – curated home page content
router.get('/home', async (req, res) => {
    try {
        const [trendingR, freshR, romanceR, workoutR, albumsR] = await Promise.allSettled([
            saavnGet('/search/songs?query=Bollywood+top+songs+2024&limit=15&page=1'),
            saavnGet('/search/songs?query=new+Hindi+songs+2024&limit=10&page=1'),
            saavnGet('/search/songs?query=Bollywood+romantic+love+songs&limit=10&page=1'),
            saavnGet('/search/songs?query=gym+workout+motivation+English+songs&limit=10&page=1'),
            saavnGet('/search/albums?query=Bollywood+albums+2024&limit=10'),
        ]);

        res.json({
            trending: trendingR.status === 'fulfilled' ? (trendingR.value?.data?.results || []).map(normalizeSong).filter(Boolean) : [],
            fresh: freshR.status === 'fulfilled' ? (freshR.value?.data?.results || []).map(normalizeSong).filter(Boolean) : [],
            romantic: romanceR.status === 'fulfilled' ? (romanceR.value?.data?.results || []).map(normalizeSong).filter(Boolean) : [],
            workout: workoutR.status === 'fulfilled' ? (workoutR.value?.data?.results || []).map(normalizeSong).filter(Boolean) : [],
            albums: albumsR.status === 'fulfilled' ? (albumsR.value?.data?.results || []).map(normalizeAlbum).filter(Boolean) : [],
        });
    } catch (err) {
        console.error('[JioSaavn] home error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jiosaavn/genre?name=Hip-Hop&limit=20
router.get('/genre', async (req, res) => {
    try {
        const { name = 'Bollywood', limit = 20 } = req.query;
        const query = GENRE_QUERIES[name] || `${name} songs`;
        const data = await saavnGet(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}&page=1`);
        const songs = (data?.data?.results || []).map(normalizeSong).filter(Boolean);
        res.json({ songs, genre: name });
    } catch (err) {
        console.error('[JioSaavn] genre error:', err.message);
        res.status(500).json({ message: err.message, songs: [] });
    }
});

// GET /api/jiosaavn/songs/:id
router.get('/songs/:id', async (req, res) => {
    try {
        const rawId = req.params.id.replace(/^jio_/, '');
        const data = await saavnGet(`/songs?id=${rawId}`);
        const songs = (data?.data || []).map(normalizeSong).filter(Boolean);
        if (!songs.length) return res.status(404).json({ message: 'Song not found' });
        res.json(songs[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jiosaavn/albums/:id
router.get('/albums/:id', async (req, res) => {
    try {
        const rawId = req.params.id.replace(/^jio_/, '');
        const data = await saavnGet(`/albums?id=${rawId}`);
        const album = normalizeAlbum(data?.data);
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/jiosaavn/artists/:id
router.get('/artists/:id', async (req, res) => {
    try {
        const rawId = req.params.id.replace(/^jio_/, '');
        const [artistR, songsR, albumsR] = await Promise.allSettled([
            saavnGet(`/artists/${rawId}`),
            saavnGet(`/artists/${rawId}/songs?page=0&songCount=20`),
            saavnGet(`/artists/${rawId}/albums?page=0&albumCount=10`),
        ]);

        const artist = artistR.status === 'fulfilled' ? normalizeArtist(artistR.value?.data) : null;
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        artist.songs = songsR.status === 'fulfilled' ? (songsR.value?.data?.songs || []).map(normalizeSong).filter(Boolean) : [];
        artist.albums = albumsR.status === 'fulfilled' ? (albumsR.value?.data?.albums || []).map(normalizeAlbum).filter(Boolean) : [];

        res.json(artist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
