import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';

const GENRES = [
  { name: 'Bollywood', color: '#e91429' }, { name: 'Phonk', color: '#1a1a2e' },
  { name: 'Hollywood', color: '#1e3264' }, { name: 'K-Pop', color: '#dc148c' },
  { name: 'Hip Hop', color: '#ba5d07' }, { name: 'Lofi', color: '#0d73ec' },
  { name: 'Punjabi', color: '#503750' }, { name: 'Party', color: '#e8115b' },
  { name: 'Workout', color: '#148a08' }, { name: 'Classical', color: '#27856a' },
  { name: 'Devotional', color: '#e8a029' }, { name: 'Trending', color: '#1DB954' },
];

function getImage(url, source) {
  if (!url) return '';
  if (source === 'YouTube') return url.replace('default.jpg', 'maxresdefault.jpg').replace('hqdefault', 'maxresdefault');
  if (source === 'iTunes') return url.replace('100x100bb', '600x600bb').replace('100x100', '600x600');
  if (url.includes('saavn') || url.includes('jiosaavn')) return url.replace('150x150', '500x500').replace('50x50', '500x500');
  return url;
}

function getSourceColor(source) {
  const c = { JioSaavn: '#1DB954', YouTube: '#FF0000', Audius: '#CC0000', Deezer: '#A238FF', iTunes: '#FC3C44' };
  return c[source] || '#535353';
}

function SongImage({ src, source, size = 46, radius = 4 }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, background: `linear-gradient(135deg,${getSourceColor(source)}44,#1a1a1a)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!failed && src ? (
        <img src={getImage(src, source)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setFailed(true)} />
      ) : (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// SEARCH ALL PLATFORMS — YouTube FULL songs first
// ── YOUR YouTube API — FULL songs, every song ever ──
// ══════════════════════════════════════════
const YOUR_API = 'https://new-youtube-o7cl.onrender.com';

async function searchEverywhere(query) {
  const seen = new Set();
  const ytSongs = [];
  const saavnSongs = [];
  const saavnArtists = [];
  const saavnPlaylists = [];
  const audiusSongs = [];
  const previews = [];

  const makeKey = s => `${s.title?.toLowerCase().slice(0, 25)}-${s.artist?.toLowerCase().slice(0, 15)}`;

  const addTo = (arr, song) => {
    const k = makeKey(song);
    if (!seen.has(k) && song.title && song.audioUrl) {
      seen.add(k); arr.push(song);
    }
  };

  await Promise.allSettled([
    // ── YOUR YouTube API — FULL songs ──
    fetch(`${YOUR_API}/search?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(10000)
    }).then(r => r.json()).then(items => {
      (items || []).forEach(item => {
        if (!item.videoId) return;
        addTo(ytSongs, {
          id: `yt-${item.videoId}`,
          videoId: item.videoId,
          title: item.title,
          artist: extractArtist(item.title),
          albumArt: item.thumbnail?.replace('hqdefault', 'maxresdefault').replace('hq720', 'maxresdefault'),
          duration: item.duration || 0,
          audioUrl: `${YOUR_API}/audio?videoId=${item.videoId}`,
          downloadUrl: [{ url: `${YOUR_API}/audio?videoId=${item.videoId}`, quality: 'full' }],
          source: 'YouTube',
          type: 'song',
          isPreview: false,
        });
      });
    }).catch(e => console.log('YT API error:', e)),

    // ── JioSaavn — SONGS ──
    fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=10`, {
      signal: AbortSignal.timeout(8000)
    }).then(r => r.json()).then(d => {
      (d?.data?.results || []).forEach(s => {
        const urls = s.downloadUrl || [];
        const best = urls.find(u => u.quality === '320kbps') || urls.find(u => u.quality === '160kbps') || urls[urls.length - 1];
        if (best?.url) addTo(saavnSongs, {
          id: `saavn-${s.id}`,
          title: s.name,
          artist: s.artists?.primary?.map(a => a.name).join(', ') || 'Unknown',
          album: s.album?.name || '',
          albumArt: s.image?.[2]?.url || s.image?.[1]?.url || '',
          duration: s.duration,
          audioUrl: best.url,
          downloadUrl: s.downloadUrl,
          source: 'JioSaavn',
          type: 'song',
          isPreview: false,
        });
      });
    }).catch(() => { }),

    // ── JioSaavn — ARTISTS ──
    fetch(`https://saavn.dev/api/search/artists?query=${encodeURIComponent(query)}&limit=5`)
      .then(r => r.json()).then(d => {
        (d?.data?.results || []).forEach(a => {
          saavnArtists.push({
            id: `artist-${a.id}`,
            name: a.name,
            artist: 'Artist',
            albumArt: a.image?.[2]?.url || a.image?.[1]?.url || '',
            source: 'JioSaavn',
            type: 'artist'
          });
        });
      }).catch(() => { }),

    // ── JioSaavn — PLAYLISTS ──
    fetch(`https://saavn.dev/api/search/playlists?query=${encodeURIComponent(query)}&limit=5`)
      .then(r => r.json()).then(d => {
        (d?.data?.results || []).forEach(p => {
          saavnPlaylists.push({
            id: `playlist-${p.id}`,
            name: p.name,
            artist: `Playlist · ${p.songCount || 0} songs`,
            albumArt: p.image?.[2]?.url || p.image?.[1]?.url || '',
            source: 'JioSaavn',
            type: 'playlist'
          });
        });
      }).catch(() => { }),

    // ── Audius — SONGS ──
    fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=10&app_name=SpotifyClone`, {
      signal: AbortSignal.timeout(8000)
    }).then(r => r.json()).then(d => {
      (d?.data || []).forEach(s => {
        const url = `https://discoveryprovider.audius.co/v1/tracks/${s.id}/stream?app_name=SpotifyClone`;
        addTo(audiusSongs, {
          id: `audius-${s.id}`,
          title: s.title,
          artist: s.user?.name || 'Unknown',
          albumArt: s.artwork?.['1000x1000'] || s.artwork?.['480x480'] || '',
          duration: s.duration,
          audioUrl: url,
          downloadUrl: [{ url, quality: 'full' }],
          source: 'Audius',
          type: 'song',
          isPreview: false,
        });
      });
    }).catch(() => { }),

    // ── Deezer 30s preview ──
    fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=8`, {
      signal: AbortSignal.timeout(6000)
    }).then(r => r.json()).then(d => {
      (d?.data || []).forEach(s => {
        if (s.preview) addTo(previews, {
          id: `deezer-${s.id}`,
          title: s.title,
          artist: s.artist?.name || 'Unknown',
          albumArt: s.album?.cover_xl || s.album?.cover_big || '',
          duration: 30, audioUrl: s.preview,
          downloadUrl: [{ url: s.preview, quality: 'preview' }],
          source: 'Deezer',
          type: 'song',
          isPreview: true,
        });
      });
    }).catch(() => { }),
  ]);

  // Mix Artist/Playlist into "All" or keep separate
  return {
    songs: [...ytSongs, ...saavnSongs, ...audiusSongs, ...previews],
    artists: saavnArtists,
    playlists: saavnPlaylists
  };
}

function extractArtist(title) {
  if (!title) return 'Unknown';
  if (title.includes(' - ')) return title.split(' - ')[0].trim();
  if (title.includes(' | ')) return title.split(' | ')[1]?.trim() || 'Unknown';
  return 'Unknown';
}

function SongSheet({ song, songs, onClose }) {
  const { playSong } = usePlayerStore();
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 19998 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#282828', borderRadius: '16px 16px 0 0', zIndex: 19999, paddingBottom: '32px', animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <SongImage src={song.albumArt} source={song.source} size={54} radius={8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
            <div style={{ color: '#b3b3b3', fontSize: '13px', marginTop: '2px' }}>{song.artist}</div>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: `${getSourceColor(song.source)}22`, color: getSourceColor(song.source), fontWeight: 700, marginTop: '4px', display: 'inline-block', border: `1px solid ${getSourceColor(song.source)}44` }}>
              {song.source} {song.isPreview ? '· 30s preview' : '· Full song'}
            </span>
          </div>
        </div>
        <button onClick={() => { playSong(song, songs); onClose(); }}
          style={{ width: 'calc(100% - 40px)', margin: '14px 20px 4px', padding: '15px', background: '#1DB954', border: 'none', borderRadius: '500px', color: 'black', fontSize: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
          Play now
        </button>
        {[
          { icon: '❤️', label: 'Save to Liked Songs', fn: () => { const l = JSON.parse(localStorage.getItem('likedSongs') || '[]'); if (!l.some(s => s.id === song.id)) { l.unshift(song); localStorage.setItem('likedSongs', JSON.stringify(l)); } onClose(); } },
          { icon: '➕', label: 'Add to playlist', fn: () => { const n = prompt('Playlist name?'); if (!n) return; const p = JSON.parse(localStorage.getItem('playlists') || '[]'); const e = p.find(x => x.name === n); if (e) e.songs.push(song); else p.push({ id: Date.now(), name: n, songs: [song] }); localStorage.setItem('playlists', JSON.stringify(p)); onClose(); } },
          { icon: '📤', label: 'Share', fn: () => { navigator.share?.({ title: song.title, text: `${song.title} by ${song.artist}` }) || navigator.clipboard?.writeText(`${song.title} — ${song.artist}`); onClose(); } },
        ].map(o => (
          <button key={o.label} onClick={o.fn}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onTouchEnd={e => e.currentTarget.style.background = 'none'}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '20px' }}>{o.icon}</span>
            </div>
            {o.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], artists: [], playlists: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedSong, setSelectedSong] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults({ songs: [], artists: [], playlists: [] }); setSearched(false); setLoading(false); return; }
    setLoading(true); setSearched(true); setFilter('All');
    try { setResults(await searchEverywhere(q.trim())); }
    catch { setResults({ songs: [], artists: [], playlists: [] }); }
    setLoading(false);
  }, []);

  const handleInput = val => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults({ songs: [], artists: [], playlists: [] }); setLoading(false); setSearched(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 700);
  };

  const fmt = s => s ? `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}` : '';

  // Custom categories for premium look
  const categories = ['All', 'Songs', 'Artists', 'Playlists'];
  const [category, setCategory] = useState('All');

  const allSongs = results.songs;
  const allArtists = results.artists;
  const allPlaylists = results.playlists;

  const hasResults = allSongs.length > 0 || allArtists.length > 0 || allPlaylists.length > 0;

  return (
    <div style={{ background: '#121212', minHeight: '100vh', paddingBottom: '140px' }}>

      {/* Header */}
      <div style={{ padding: '0 16px 8px', paddingTop: 'calc(env(safe-area-inset-top,28px) + 12px)', position: 'sticky', top: 0, background: '#121212', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900 }}>Search</h1>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#535353" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input ref={inputRef} type="text" inputMode="search" value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (clearTimeout(debounceRef.current), doSearch(query))}
            placeholder="What do you want to listen to?"
            autoComplete="off" autoCorrect="off" spellCheck={false}
            style={{ width: '100%', height: '46px', padding: '0 44px', background: 'white', border: 'none', borderRadius: '6px', color: '#121212', fontSize: '14px', fontWeight: 500, outline: 'none', boxSizing: 'border-box' }}
          />
          {query && <button onClick={() => { setQuery(''); setResults({ songs: [], artists: [], playlists: [] }); setSearched(false); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#535353"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>}
        </div>

        {searched && hasResults && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', noScrollbar: true }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ flexShrink: 0, padding: '7px 16px', borderRadius: '500px', background: category === cat ? '#1DB954' : '#282828', color: category === cat ? 'black' : 'white', fontSize: '12px', fontWeight: 700, border: 'none' }}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#1DB954', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#b3b3b3', fontSize: '13px', fontWeight: 600 }}>Searching for "{query}"...</p>
        </div>
      )}

      {!loading && searched && hasResults && (
        <div style={{ padding: '0 16px' }}>

          {/* TOP RESULT (Standard Spotify feature) */}
          {(category === 'All') && allArtists[0] && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>Top result</h2>
              <div onClick={() => navigate(`/artists?id=${allArtists[0].id.replace('artist-', '')}`)}
                style={{ padding: '20px', background: '#181818', borderRadius: '8px', cursor: 'pointer' }}>
                <img src={allArtists[0].albumArt} style={{ width: '88px', height: '88px', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
                <div style={{ color: 'white', fontSize: '24px', fontWeight: 900 }}>{allArtists[0].name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 700, textTransform: 'uppercase' }}>Artist</span>
                </div>
              </div>
            </div>
          )}

          {/* SONGS SECTION */}
          {(category === 'All' || category === 'Songs') && allSongs.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>Songs</h2>
              {allSongs.slice(0, category === 'Songs' ? 50 : 5).map((song, i) => (
                <div key={song.id} onClick={() => playSong(song, allSongs)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                  <img src={song.albumArt} style={{ width: '46px', height: '46px', borderRadius: '4px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: currentSong?.id === song.id ? '#1DB954' : 'white', fontSize: '14px', fontWeight: 700, truncate: true }}>{song.title}</div>
                    <div style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '2px' }}>{song.artist}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedSong(song); }} style={{ background: 'none', border: 'none', padding: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ARTISTS SECTION */}
          {(category === 'All' || category === 'Artists') && allArtists.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>Artists</h2>
              {allArtists.slice(0, 10).map(a => (
                <div key={a.id} onClick={() => navigate(`/artists?name=${encodeURIComponent(a.name)}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                  <img src={a.albumArt} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{a.name}</div>
                    <div style={{ color: '#b3b3b3', fontSize: '12px' }}>Artist</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PLAYLISTS SECTION */}
          {(category === 'All' || category === 'Playlists') && allPlaylists.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 900, marginBottom: '14px' }}>Playlists</h2>
              {allPlaylists.slice(0, 10).map(p => (
                <div key={p.id} onClick={() => navigate(`/playlists?id=${p.id.replace('playlist-', '')}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                  <img src={p.albumArt} style={{ width: '48px', height: '48px', borderRadius: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{p.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && searched && !hasResults && (
        <div style={{ textAlign: 'center', padding: '100px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 800 }}>No results found</h2>
          <p style={{ color: '#b3b3b3', fontSize: '14px', marginTop: '8px' }}>Try searching something else</p>
          <button
            onClick={() => window.open(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`, '_blank')}
            style={{ marginTop: '24px', padding: '12px 24px', background: '#FF0000', border: 'none', borderRadius: '500px', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
          >
            🎬 Open in YouTube Music
          </button>
        </div>
      )}

      {/* Browse All (Initial State) */}
      {!query && !loading && (
        <div style={{ padding: '8px 16px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>Browse all</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {GENRES.map(g => (
              <div key={g.name} onClick={() => { setQuery(g.name); doSearch(g.name); }}
                style={{ background: g.color, borderRadius: '8px', padding: '16px 14px', minHeight: '80px', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
              >
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 800, position: 'relative', zIndex: 1 }}>{g.name}</span>
                <div style={{ position: 'absolute', bottom: '-4px', right: '-10px', fontSize: '46px', opacity: 0.2, transform: 'rotate(25deg)' }}>🎵</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSong && <SongSheet song={selectedSong} songs={allSongs} onClose={() => setSelectedSong(null)} />}
    </div>
  );
}