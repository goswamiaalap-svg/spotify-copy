const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CORS — allow everything
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// Quick test route — visit in browser to confirm backend works
app.get('/api/test-search', async (req, res) => {
  const q = req.query.q || 'arijit singh';
  try {
    const result = await axios.get(
      `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(q)}&limit=5`,
      { timeout: 10000 }
    );
    res.json({
      status: 'WORKING',
      query: q,
      count: result.data?.data?.results?.length,
      firstSong: result.data?.data?.results?.[0]?.name
    });
  } catch (e) {
    res.json({ status: 'BROKEN', error: e.message });
  }
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// ✅ MAIN SEARCH — calls JioSaavn directly
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: false, results: [] });

  console.log('\n🔍 SEARCHING FOR:', q);

  try {
    const response = await axios.get(
      `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(q)}&page=1&limit=20`,
      { timeout: 12000, headers: { 'Accept': 'application/json' } }
    );

    const songs = response.data?.data?.results || [];
    console.log(`✅ Found ${songs.length} songs for "${q}"`);

    // Clean and return results
    const cleaned = songs.map(s => ({
      id: s.id,
      title: s.name,
      artist: s.artists?.primary?.[0]?.name || s.primaryArtists || 'Unknown',
      album: s.album?.name || '',
      albumArt: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || '',
      duration: s.duration,
      downloadUrl: s.downloadUrl,
      source: 'saavn'
    }));

    res.json({ success: true, results: cleaned, count: cleaned.length });
  } catch (err) {
    console.error('❌ Search error:', err.message);
    res.status(500).json({ success: false, error: err.message, results: [] });
  }
});

// ✅ GET SONG AUDIO URL
app.get('/api/song/:id', async (req, res) => {
  const { id } = req.params;
  console.log('\n🎵 GETTING SONG:', id);

  try {
    const response = await axios.get(
      `https://jiosaavn-api-privatecvc2.vercel.app/songs?id=${id}`,
      { timeout: 12000 }
    );

    const song = Array.isArray(response.data?.data) ? response.data.data[0] : response.data?.data?.[0];
    if (!song) throw new Error('Song not found');

    const urls = song.downloadUrl || [];
    // Pick best quality
    const best = urls.find(u => u.quality === '320kbps')
      || urls.find(u => u.quality === '160kbps')
      || urls.find(u => u.quality === '96kbps')
      || urls[urls.length - 1];

    const audioUrl = (best?.link || best?.url) ? decodeURIComponent(best?.link || best?.url) : null;
    if (!audioUrl) throw new Error('No audio URL in response');

    console.log('✅ Got audio URL for:', song.name);
    res.json({
      success: true,
      audioUrl,
      quality: best?.quality,
      title: song.name,
      artist: song.artists?.primary?.[0]?.name || song.primaryArtists,
      albumArt: song.image?.[2]?.link || song.image?.[2]?.url
    });
  } catch (err) {
    console.error('❌ Song fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ YOUTUBE SEARCH
app.get('/api/youtube/search', async (req, res) => {
  const { q } = req.query;
  try {
    const ytSearch = require('yt-search');
    const result = await ytSearch(`${q} official audio`);
    const videos = result.videos
      .filter(v => v.seconds > 60 && v.seconds < 600)
      .slice(0, 10)
      .map(v => ({
        id: v.videoId,
        title: v.title
          .replace(/\(Official.*?\)/gi, '')
          .replace(/Official (Audio|Video)/gi, '')
          .replace(/\[.*?\]/g, '')
          .trim(),
        artist: v.author.name.replace('- Topic', '').trim(),
        album: 'YouTube',
        albumArt: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
        duration: v.seconds,
        durationText: v.timestamp,
        source: 'youtube',
        videoId: v.videoId
      }));
    console.log(`✅ YouTube found ${videos.length} for "${q}"`);
    res.json({ success: true, results: videos });
  } catch (err) {
    console.error('❌ YouTube search error:', err.message);
    res.json({ success: false, results: [], error: err.message });
  }
});

// ✅ YOUTUBE AUDIO URL
app.get('/api/youtube/audio/:videoId', async (req, res) => {
  try {
    const play = require('play-dl');
    const url = `https://www.youtube.com/watch?v=${req.params.videoId}`;
    const info = await play.video_info(url);
    const formats = info.format.filter(f => f.hasAudio && !f.hasVideo);
    formats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const best = formats[0] || info.format[0];

    if (!best?.url) throw new Error('No audio format');
    res.json({ success: true, url: best.url });
  } catch (err) {
    console.error('❌ YT audio error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// MongoDB connect
const mongoose = require('mongoose');
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(e => console.log('⚠️ MongoDB:', e.message));
}

// Register other routes if they exist
try { app.use('/api/auth', require('./routes/auth')); } catch (e) { }
try { app.use('/api/users', require('./routes/users')); } catch (e) { }

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n✅ SERVER RUNNING: http://localhost:${PORT}`);
    console.log(`✅ Test health: http://localhost:${PORT}/api/health`);
    console.log(`✅ Test search: http://localhost:${PORT}/api/search?q=arijit`);
  });
}

module.exports = app;
