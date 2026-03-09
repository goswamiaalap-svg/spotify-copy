// client/src/pages/PlaylistsPage.jsx — COMPLETE REWRITE
import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlayerStore } from '../store/playerStore';

const SAAVN = 'https://saavn.dev/api';

const CURATED = [
    { id: 'bollywood', name: 'Bollywood Hits', query: 'best bollywood songs 2024 hindi', color: '#e91429', emoji: '🎬' },
    { id: 'romantic', name: 'Romantic Mood', query: 'hindi romantic love songs arijit', color: '#8d67ab', emoji: '❤️' },
    { id: 'party', name: 'Party Anthems', query: 'punjabi party dance songs 2024', color: '#e8115b', emoji: '🎉' },
    { id: 'workout', name: 'Workout Mix', query: 'high energy workout motivation songs hindi', color: '#ba5d07', emoji: '💪' },
    { id: 'sad', name: 'Sad Songs', query: 'sad hindi emotional songs breakup', color: '#1e3264', emoji: '😢' },
    { id: 'arijit', name: 'Arijit Special', query: 'arijit singer best songs collection', color: '#27856a', emoji: '🎤' },
];

function parseSongs(results) {
    return (results || []).map(s => ({
        id: s.id, title: s.name,
        artist: s.artists?.primary?.[0]?.name || 'Unknown',
        album: s.album?.name || '',
        albumArt: s.image?.[2]?.url || s.image?.[1]?.url || '',
        duration: s.duration, downloadUrl: s.downloadUrl, source: 'saavn'
    }));
}

export default function PlaylistsPage() {
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [curatedSongs, setCuratedSongs] = useState({});
    const [selected, setSelected] = useState(null);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const { playSong } = usePlayerStore();

    useEffect(() => {
        setUserPlaylists(JSON.parse(localStorage.getItem('playlists') || '[]'));
    }, []);

    const openCurated = async (pl) => {
        if (!pl || loadingId) return;
        if (curatedSongs[pl.id]?.length > 1) {
            setSelected({ ...pl, type: 'curated' });
            setSelectedSongs(curatedSongs[pl.id]);
            return;
        }
        setLoadingId(pl.id);

        try {
            // Try direct fetch by ID first (if it's a real JioSaavn ID)
            if (typeof pl.id === 'string' && pl.id.length > 5) {
                const res = await axios.get(`${SAAVN}/playlists?id=${pl.id}`);
                const data = res.data?.data;
                if (data?.songs?.length > 0) {
                    const songs = parseSongs(data.songs);
                    setCuratedSongs(prev => ({ ...prev, [pl.id]: songs }));
                    setSelected({ ...pl, name: data.name, type: 'curated' });
                    setSelectedSongs(songs);
                    setLoadingId(null);
                    return;
                }
            }
        } catch { console.warn('Direct ID fetch failed, falling back to search'); }

        // Fallback to search-based "playlist"
        const queries = [pl.query, pl.name + ' songs hindi', pl.name + ' best songs'];
        let songs = [];

        for (const q of queries) {
            if (!q) continue;
            try {
                const res = await axios.get(
                    `${SAAVN}/search/songs?query=${encodeURIComponent(q)}&limit=25`,
                    { timeout: 15000 }
                );
                const results = res.data?.data?.results || [];
                if (results.length > 0) {
                    songs = parseSongs(results);
                    break;
                }
            } catch (e) {
                console.warn('Playlist query failed:', q);
            }
        }

        setCuratedSongs(prev => ({ ...prev, [pl.id]: songs }));
        setSelected({ ...pl, type: 'curated' });
        setSelectedSongs(songs);
        setLoadingId(null);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            openCurated({ id, name: 'Playlist' });
        }
    }, [window.location.search]);

    const openUser = (pl) => {
        setSelected({ ...pl, type: 'user' });
        setSelectedSongs(pl.songs || []);
    };

    const createPlaylist = () => {
        if (!newName.trim()) return;
        const pls = JSON.parse(localStorage.getItem('playlists') || '[]');
        const newPL = { id: Date.now(), name: newName.trim(), songs: [] };
        pls.push(newPL);
        localStorage.setItem('playlists', JSON.stringify(pls));
        setUserPlaylists(pls);
        setNewName(''); setCreating(false);
    };

    const deletePlaylist = (id) => {
        const pls = JSON.parse(localStorage.getItem('playlists') || '[]').filter(p => p.id !== id);
        localStorage.setItem('playlists', JSON.stringify(pls));
        setUserPlaylists(pls);
    };

    const fmt = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    if (selected) {
        return (
            <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
                <div style={{ background: `linear-gradient(180deg,${selected.color || '#1a2a2e'} 0%,#121212 280px)`, padding: '32px' }}>
                    <button onClick={() => setSelected(null)} style={{
                        background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff',
                        padding: '8px 20px', borderRadius: '500px',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '44px'
                    }}>← Back</button>
                    <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '180px', height: '180px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                            background: selected.color || '#282828',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
                        }}>
                            {selectedSongs[0]?.albumArt
                                ? <img src={selectedSongs[0].albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                : selected.emoji || '🎵'
                            }
                        </div>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Playlist</div>
                            <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>{selected.name}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{selectedSongs.length} songs</p>
                            {selectedSongs.length > 0 && (
                                <button onClick={() => playSong(selectedSongs[0], selectedSongs)} style={{
                                    marginTop: '20px', padding: '12px 36px', background: '#1DB954',
                                    border: 'none', borderRadius: '500px', color: '#000',
                                    fontWeight: 800, fontSize: '15px', cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(29,185,84,0.4)'
                                }}>▶ Play All</button>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ padding: '24px 32px' }}>
                    {selectedSongs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#a7a7a7' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Playlist is empty</p>
                            <p style={{ fontSize: '13px', marginTop: '8px' }}>Add songs using the ➕ button on any song</p>
                        </div>
                    ) : selectedSongs.map((song, i) => (
                        <PlaylistSongRow key={song.id} song={song} index={i} queue={selectedSongs} playSong={playSong} fmt={fmt} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(180deg,#1a1a2e 0%,#121212 100%)', padding: '32px 32px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ color: '#fff', fontSize: '40px', fontWeight: 900, letterSpacing: '-0.5px' }}>🎵 Playlists</h1>
                    <button onClick={() => setCreating(true)} style={{
                        padding: '11px 24px', background: '#1DB954', border: 'none',
                        borderRadius: '500px', color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer'
                    }}>+ New Playlist</button>
                </div>
            </div>

            <div style={{ padding: '0 32px' }}>
                {creating && (
                    <div style={{ background: '#282828', borderRadius: '12px', padding: '20px', marginBottom: '28px', marginTop: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>Create Playlist</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="Playlist name..." autoFocus
                                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                                style={{ flex: 1, height: '44px', padding: '0 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                            />
                            <button onClick={createPlaylist} style={{ padding: '0 24px', background: '#1DB954', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Create</button>
                            <button onClick={() => setCreating(false)} style={{ padding: '0 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {userPlaylists.length > 0 && (
                    <div style={{ marginBottom: '40px', marginTop: '20px' }}>
                        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Your Playlists</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
                            {userPlaylists.map(pl => (
                                <div key={pl.id} style={{ cursor: 'pointer', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s', position: 'relative' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <div onClick={() => openUser(pl)}>
                                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '12px', overflow: 'hidden' }}>
                                            {pl.songs?.[0]?.albumArt
                                                ? <img src={pl.songs[0].albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                                : '🎵'}
                                        </div>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</div>
                                        <div style={{ color: '#a7a7a7', fontSize: '12px', marginTop: '4px' }}>{pl.songs?.length || 0} songs</div>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        background: 'rgba(0,0,0,0.7)', border: 'none',
                                        color: '#a7a7a7', cursor: 'pointer', borderRadius: '4px', padding: '3px 7px', fontSize: '12px'
                                    }}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '16px', marginTop: '20px' }}>🎧 Featured Playlists</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
                    {CURATED.map(pl => (
                        <div key={pl.id} onClick={() => openCurated(pl)}
                            style={{ cursor: 'pointer', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s', position: 'relative' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', background: pl.color, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>
                                {loadingId === pl.id ? (
                                    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                ) : (
                                    curatedSongs[pl.id]?.[0]?.albumArt
                                        ? <img src={curatedSongs[pl.id][0].albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display = 'none'} />
                                        : pl.emoji
                                )}
                            </div>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{pl.name}</div>
                            <div style={{ color: '#a7a7a7', fontSize: '12px' }}>
                                {curatedSongs[pl.id] ? `${curatedSongs[pl.id].length} songs` : 'Click to load'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PlaylistSongRow({ song, index, queue, playSong, fmt }) {
    const [h, setH] = useState(false);
    return (
        <div key={song.id} onClick={() => playSong(song, queue)}
            onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: h ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.15s' }}>
            <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {h
                    ? <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '11px', fontWeight: 900 }}>▶</div>
                    : <span style={{ color: '#a7a7a7', fontSize: '13px' }}>{index + 1}</span>
                }
            </div>
            <img src={song.albumArt} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{song.artist}</div>
            </div>
            <span style={{ color: '#a7a7a7', fontSize: '13px', flexShrink: 0 }}>{fmt(song.duration)}</span>
        </div>
    );
}
