import { useState, useRef, useCallback } from 'react';
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
    // ── YOUR YouTube API — FULL songs via Render ──
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
          isPreview: false,
        });
      });
    }).catch(e => console.log('YT API error:', e)),

    // ── JioSaavn — FULL SONGS ──
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
          source: 'JioSaavn', isPreview: false,
        });
      });
    }).catch(() => { }),

    // ── Audius — FULL SONGS ──
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
          source: 'Audius', isPreview: false,
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
          source: 'Deezer', isPreview: true,
        });
      });
    }).catch(() => { }),
  ]);

  // YouTube first → JioSaavn → Audius → Deezer previews
  return [...ytSongs, ...saavnSongs, ...audiusSongs, ...previews];
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedSong, setSelectedSong] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); setLoading(false); return; }
    setLoading(true); setSearched(true); setFilter('All');
    try { setResults(await searchEverywhere(q.trim())); }
    catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleInput = val => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); setSearched(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 700);
  };

  const fmt = s => s ? `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}` : '';
  const sources = ['All', 'YouTube', 'JioSaavn', 'Audius', 'Deezer'];
  const filtered = filter === 'All' ? results : results.filter(s => s.source === filter);
  const fullCount = results.filter(s => !s.isPreview).length;
  const previewCount = results.filter(s => s.isPreview).length;

  return (
    <div style={{ background: '#121212', minHeight: '100vh', paddingBottom: '140px' }}>

      {/* Header */}
      <div style={{ padding: '0 16px 8px', paddingTop: 'calc(env(safe-area-inset-top,28px) + 12px)', position: 'sticky', top: 0, background: '#121212', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900 }}>Search</h1>
          </div>
          {searched && results.length > 0 && (
            <div style={{ background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.25)', borderRadius: '500px', padding: '4px 12px', color: '#1DB954', fontSize: '12px', fontWeight: 700 }}>
              {fullCount} full · {previewCount} preview
            </div>
          )}
        </div>

        <div style={{ position: 'relative', marginBottom: searched && results.length > 0 ? '10px' : '0' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#535353" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input ref={inputRef} type="text" inputMode="search" value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (clearTimeout(debounceRef.current), doSearch(query))}
            placeholder="Songs, artists, albums"
            autoComplete="off" autoCorrect="off" spellCheck={false}
            style={{ width: '100%', height: '46px', padding: '0 44px', background: 'white', border: 'none', borderRadius: '6px', color: '#121212', fontSize: '15px', fontWeight: 500, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
          />
          {query && <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#535353"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>}
        </div>

        {/* Source filter pills */}
        {searched && results.length > 0 && (
          <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {sources.map(s => {
              const count = s === 'All' ? results.length : results.filter(r => r.source === s).length;
              if (s !== 'All' && count === 0) return null;
              return <button key={s} onClick={() => setFilter(s)}
                style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '500px', border: '1px solid', borderColor: filter === s ? 'white' : 'rgba(255,255,255,0.15)', background: filter === s ? 'white' : 'transparent', color: filter === s ? '#121212' : 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {s} ({count})
              </button>;
            })}
          </div>
        )}
      </div>

      {/* Loading — 3 spinning rings */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 20px' }}>
            <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(255,0,0,0.15)', borderTopColor: '#FF0000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <div style={{ position: 'absolute', inset: '8px', border: '3px solid rgba(29,185,84,0.15)', borderTopColor: '#1DB954', borderRadius: '50%', animation: 'spin 1s linear infinite reverse' }} />
            <div style={{ position: 'absolute', inset: '16px', border: '3px solid rgba(204,0,0,0.15)', borderTopColor: '#CC0000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          </div>
          <p style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Searching everywhere…</p>
          <p style={{ color: '#b3b3b3', fontSize: '13px' }}>YouTube · JioSaavn · Audius · Deezer</p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div style={{ padding: '4px 16px' }}>
          {filtered.map((song, idx) => {
            const active = currentSong?.id === song.id;
            const isFirstPreview = song.isPreview && (idx === 0 || !filtered[idx - 1]?.isPreview);
            return (
              <div key={`${song.id}-${idx}`}>
                {isFirstPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0 8px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#FFA500', fontSize: '11px', fontWeight: 700 }}>⚠️ 30-second previews</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                )}
                <div onClick={() => playSong(song, filtered)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: active ? 'rgba(29,185,84,0.06)' : 'transparent' }}
                  onTouchStart={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onTouchEnd={e => { e.currentTarget.style.background = active ? 'rgba(29,185,84,0.06)' : 'transparent'; }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <SongImage src={song.albumArt} source={song.source} size={46} radius={4} />
                    {active && isPlaying && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                          {[6, 12, 8].map((h, i) => <div key={i} style={{ width: '3px', background: '#1DB954', height: `${h}px`, borderRadius: '2px', animation: `eq${i + 1} ${0.4 + i * 0.1}s ease infinite alternate` }} />)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: active ? '#1DB954' : 'white', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ color: '#b3b3b3', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{song.artist}</span>
                      <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: `${getSourceColor(song.source)}18`, color: getSourceColor(song.source), fontWeight: 700, flexShrink: 0, border: `1px solid ${getSourceColor(song.source)}33` }}>{song.source}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span style={{ color: '#535353', fontSize: '11px' }}>{fmt(song.duration)}</span>
                    {song.isPreview && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,165,0,0.15)', color: '#FFA500', fontWeight: 700 }}>30s</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedSong(song); }}
                    style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: 'white', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Nothing found for "{query}"</p>
          <button onClick={() => window.open(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`, '_blank')}
            style={{ width: '100%', padding: '14px', background: '#FF0000', border: 'none', borderRadius: '500px', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer', marginBottom: '10px' }}>
            🎬 Open in YouTube Music
          </button>
        </div>
      )}

      {/* Browse */}
      {!query && !loading && (
        <div style={{ padding: '8px 16px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>Browse all</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {GENRES.map(g => (
              <div key={g.name} onClick={() => { setQuery(g.name); doSearch(g.name); }}
                style={{ background: g.color, borderRadius: '8px', padding: '16px 14px', minHeight: '80px', cursor: 'pointer' }}
                onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSong && <SongSheet song={selectedSong} songs={filtered} onClose={() => setSelectedSong(null)} />}
    </div>
  );
}