import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

export default function ImportPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState('');
    const [imported, setImported] = useState(false);
    const { playSong } = usePlayerStore();

    const extractPlaylistId = (input) => {
        const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const importPlaylist = async () => {
        setError('');
        setSongs([]);
        setImported(false);
        const playlistId = extractPlaylistId(url);

        if (!playlistId && !url.trim()) {
            setError('Please paste a Spotify playlist URL or enter song names');
            return;
        }

        setLoading(true);

        // Since Spotify API needs auth, we'll search each song on JioSaavn
        // Use a public Spotify embed scrape approach
        try {
            if (playlistId) {
                // Fetch playlist track names from Spotify embed (public, no auth needed)
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://open.spotify.com/playlist/${playlistId}`)}`;
                const r = await fetch(proxyUrl);
                const d = await r.json();

                // Extract track names from page HTML
                const html = d.contents || '';
                const trackMatches = [...html.matchAll(/"name":"([^"]+)","type":"track"/g)];
                const artistMatches = [...html.matchAll(/"artists":\[{"name":"([^"]+)"/g)];

                if (trackMatches.length === 0) {
                    setError('Could not read playlist. Make sure it is a PUBLIC Spotify playlist.');
                    setLoading(false);
                    return;
                }

                const tracks = trackMatches.slice(0, 20).map((m, i) => ({
                    name: m[1],
                    artist: artistMatches[i]?.[1] || ''
                }));

                // Search each track on JioSaavn
                const found = [];
                for (const track of tracks) {
                    try {
                        const q = `${track.name} ${track.artist}`.trim();
                        const r = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(q)}&limit=1`);
                        if (r.ok) {
                            const data = await r.json();
                            const s = data?.data?.results?.[0];
                            if (s && s.downloadUrl?.length) {
                                found.push({
                                    id: s.id,
                                    title: s.name,
                                    artist: s.artists?.primary?.map(a => a.name).join(', ') || track.artist,
                                    albumArt: s.image?.[2]?.url || s.image?.[1]?.url || '',
                                    duration: s.duration,
                                    downloadUrl: s.downloadUrl,
                                    source: 'saavn'
                                });
                            }
                        }
                    } catch { }
                }

                setSongs(found);
                if (found.length === 0) setError('No songs found. Try a different playlist.');

            } else {
                // Manual song name input — search directly
                const lines = url.split('\n').filter(l => l.trim()).slice(0, 20);
                const found = [];
                for (const line of lines) {
                    try {
                        const r = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(line.trim())}&limit=1`);
                        if (r.ok) {
                            const data = await r.json();
                            const s = data?.data?.results?.[0];
                            if (s) found.push({
                                id: s.id, title: s.name,
                                artist: s.artists?.primary?.map(a => a.name).join(', ') || 'Unknown',
                                albumArt: s.image?.[2]?.url || s.image?.[1]?.url || '',
                                duration: s.duration, downloadUrl: s.downloadUrl, source: 'saavn'
                            });
                        }
                    } catch { }
                }
                setSongs(found);
            }
        } catch (e) {
            setError('Import failed. Check your internet connection.');
        }
        setLoading(false);
    };

    const saveAsPlaylist = () => {
        const name = prompt('Name this playlist:');
        if (!name) return;
        const pls = JSON.parse(localStorage.getItem('playlists') || '[]');
        pls.push({ id: Date.now(), name, songs });
        localStorage.setItem('playlists', JSON.stringify(pls));
        setImported(true);
        alert(`✅ Saved "${name}" with ${songs.length} songs!`);
    };

    return (
        <div style={{ background: '#121212', minHeight: '100vh', padding: '16px', paddingTop: 'calc(var(--status-bar-height,28px) + 20px)', paddingBottom: '140px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#1DB954,#158a3e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                    </div>
                    <div>
                        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900 }}>Import from Spotify</h1>
                        <p style={{ color: '#b3b3b3', fontSize: '13px', marginTop: '2px' }}>Bring your playlists here</p>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div style={{ background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h3 style={{ color: '#1DB954', fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>How to import</h3>
                {['1. Open Spotify app', '2. Go to any PUBLIC playlist', '3. Tap Share → Copy link', '4. Paste link below → Import'].map((s, i) => (
                    <div key={i} style={{ color: '#b3b3b3', fontSize: '13px', marginBottom: '6px' }}>{s}</div>
                ))}
            </div>

            {/* Input */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'white', fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Paste Spotify playlist URL or song names (one per line)
                </label>
                <textarea
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder={'https://open.spotify.com/playlist/...\n\nor paste song names:\nDespacito\nShape of You\nLet Her Go'}
                    style={{
                        width: '100%', minHeight: '120px', padding: '14px',
                        background: '#282828', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: 'white', fontSize: '14px',
                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                        lineHeight: '1.5', fontFamily: 'inherit',
                    }}
                />
            </div>

            {error && (
                <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#ff6b6b', fontSize: '13px' }}>
                    ⚠️ {error}
                </div>
            )}

            <button onClick={importPlaylist} disabled={loading}
                style={{ width: '100%', padding: '16px', background: loading ? '#282828' : '#1DB954', border: 'none', borderRadius: '500px', color: loading ? '#b3b3b3' : 'black', fontSize: '15px', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {loading ? (
                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Importing songs…</>
                ) : '🎵 Import Songs'}
            </button>

            {/* Results */}
            {songs.length > 0 && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ color: 'white', fontSize: '17px', fontWeight: 800 }}>Found {songs.length} songs</h2>
                        <button onClick={saveAsPlaylist}
                            style={{ background: '#1DB954', border: 'none', borderRadius: '500px', color: 'black', padding: '8px 18px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                            Save Playlist
                        </button>
                    </div>

                    {songs.map(song => (
                        <div key={song.id} onClick={() => playSong(song, songs)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                            <img src={song.albumArt} style={{ width: '46px', height: '46px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0, background: '#282828' }} onError={e => e.target.style.background = '#282828'} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: 'white', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                                <div style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '2px' }}>{song.artist}</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                            </button>
                        </div>
                    ))}

                    <button onClick={() => playSong(songs[0], songs)}
                        style={{ width: '100%', margin: '20px 0', padding: '16px', background: '#1DB954', border: 'none', borderRadius: '500px', color: 'black', fontSize: '15px', fontWeight: 900, cursor: 'pointer' }}>
                        ▶ Play All {songs.length} Songs
                    </button>
                </>
            )}
        </div>
    );
}
