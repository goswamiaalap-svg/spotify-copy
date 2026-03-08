// client/src/pages/AlbumsPage.jsx — COMPLETE REWRITE using fetch() only
import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

const ALBUMS = [
    { name: 'Animal (2023)', queries: ['Arjan Vailly Ranbir Kapoor', 'Satranga Arijit Singh Animal', 'Animal 2023 Bollywood'] },
    { name: 'Stree 2', queries: ['Aaj Ki Raat Stree 2 Tamannaah', 'Stree 2 Bollywood 2024', 'Aaj Ki Raat hai Mushkil'] },
    { name: 'Jawan 2023', queries: ['Chaleya Jawan Arijit Singh Shah Rukh', 'Not Ramaiya Vastavaiya Jawan', 'Jawan Shah Rukh Khan songs'] },
    { name: 'Dunki', queries: ['Lutt Putt Gaya Dunki Shah Rukh', 'O Maahi Dunki Pritam', 'Dunki songs 2023'] },
    { name: 'Kabir Singh', queries: ['Tujhe Kitna Chahne Lage Kabir Singh', 'Bekhayali Kabir Singh Sachet', 'Kabir Singh film songs'] },
    { name: 'Pathaan', queries: ['Besharam Rang Pathaan Deepika', 'Pathaan songs Shah Rukh 2023', 'Jhoom Pathaan Arijit'] },
    { name: 'Rocky Aur Rani', queries: ['What Jhumka Rocky Rani Ranveer Alia', 'Tum Kya Mile Rocky Aur Rani', 'Rocky Aur Rani songs'] },
    { name: 'Gadar 2', queries: ['Teri Mitti Gadar 2 Sunny Deol', 'Udd Ja Kaale Gadar 2', 'Gadar 2 songs 2023'] },
    { name: 'Brahmastra', queries: ['Kesariya Brahmastra Ranbir Arijit', 'Dance Ka Bhoot Brahmastra Amitabh', 'Brahmastra songs'] },
    { name: 'War 2019', queries: ['Ghungroo War Hrithik Tiger', 'Jai Jai Shivshankar War', 'War 2019 film songs Hrithik'] },
];

async function searchSongs(query) {
    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=10`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return [];
        const data = await res.json();
        return data?.data?.results || [];
    } catch {
        clearTimeout(timer);
        return [];
    }
}

function parseSongs(results, albumName) {
    return results.map(s => ({
        id: s.id, title: s.name,
        artist: s.artists?.primary?.[0]?.name || 'Unknown',
        album: s.album?.name || albumName,
        albumArt: s.image?.[2]?.url || s.image?.[1]?.url || '',
        duration: s.duration, downloadUrl: s.downloadUrl, source: 'saavn'
    }));
}

export default function AlbumsPage() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [selected, setSelected] = useState(null);
    const { playSong } = usePlayerStore();

    useEffect(() => { loadAlbums(); }, []);

    const loadAlbums = async () => {
        setLoading(true);
        setAlbums([]);
        setProgress(0);
        const loaded = [];

        for (let i = 0; i < ALBUMS.length; i++) {
            const album = ALBUMS[i];
            setProgress(Math.round((i / ALBUMS.length) * 100));

            for (const q of album.queries) {
                const results = await searchSongs(q);
                if (results.length > 0) {
                    const songs = parseSongs(results, album.name);
                    loaded.push({
                        id: album.name,
                        name: results[0]?.album?.name || album.name,
                        art: songs[0]?.albumArt || '',
                        artist: songs[0]?.artist || 'Various Artists',
                        songs
                    });
                    setAlbums([...loaded]);
                    break;
                }
                await new Promise(r => setTimeout(r, 200));
            }
            await new Promise(r => setTimeout(r, 500));
        }

        setProgress(100);
        setLoading(false);
    };

    const fmt = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    if (selected) {
        return (
            <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(180deg,#1a2a2e 0%,#121212 100%)', padding: '32px' }}>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '500px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '24px' }}>← Back to Albums</button>
                    <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <img src={selected.art} alt="" style={{ width: '180px', height: '180px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                        <div>
                            <div style={{ color: '#a7a7a7', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Album</div>
                            <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 900, marginBottom: '8px' }}>{selected.name}</h1>
                            <p style={{ color: '#a7a7a7' }}>{selected.artist} • {selected.songs.length} songs</p>
                            <button onClick={() => playSong(selected.songs[0], selected.songs)} style={{ marginTop: '20px', padding: '12px 36px', background: '#1DB954', border: 'none', borderRadius: '500px', color: '#000', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(29,185,84,0.4)' }}>▶ Play Album</button>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '0 32px' }}>
                    {selected.songs.map((song, i) => {
                        const [h, setH] = useState(false);
                        return (
                            <div key={song.id} onClick={() => playSong(song, selected.songs)}
                                onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', background: h ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.15s' }}>
                                <span style={{ color: h ? '#1DB954' : '#a7a7a7', fontSize: '14px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{h ? '▶' : i + 1}</span>
                                <img src={song.albumArt} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                                    <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{song.artist}</div>
                                </div>
                                <span style={{ color: '#a7a7a7', fontSize: '13px', flexShrink: 0 }}>{fmt(song.duration)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(180deg,#1a2a2e 0%,#121212 100%)', padding: '32px 32px 24px' }}>
                <h1 style={{ color: '#fff', fontSize: '40px', fontWeight: 900, marginBottom: '8px' }}>💿 Albums</h1>
                {loading && (
                    <div>
                        <p style={{ color: '#a7a7a7', fontSize: '13px', marginBottom: '8px' }}>Loading {albums.length}/{ALBUMS.length} albums... {progress}%</p>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', maxWidth: '240px' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: '#1DB954', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                )}
                {!loading && <p style={{ color: '#a7a7a7', fontSize: '13px' }}>✅ {albums.length} albums loaded</p>}
            </div>
            <div style={{ padding: '24px 32px 0' }}>
                {albums.length === 0 && loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '20px' }}>
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i}>
                                <div style={{ aspectRatio: '1/1', borderRadius: '8px', background: 'linear-gradient(90deg,#1a1a1a 25%,#2a2a2a 50%,#1a1a1a 75%)', backgroundSize: '400px', animation: 'shimmer 1.5s infinite', marginBottom: '10px' }} />
                                <div style={{ height: '14px', borderRadius: '4px', background: '#1a1a1a', marginBottom: '6px' }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '20px' }}>
                        {albums.map(album => (
                            <div key={album.id} onClick={() => setSelected(album)}
                                style={{ cursor: 'pointer', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <img src={album.art} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '12px' }} onError={e => e.target.style.display = 'none'} />
                                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.name}</div>
                                <div style={{ color: '#a7a7a7', fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.artist}</div>
                                <div style={{ color: '#6a6a6a', fontSize: '11px', marginTop: '4px' }}>{album.songs.length} songs</div>
                            </div>
                        ))}
                        {loading && Array(ALBUMS.length - albums.length).fill(0).map((_, i) => (
                            <div key={`sk-${i}`}>
                                <div style={{ aspectRatio: '1/1', borderRadius: '8px', background: 'linear-gradient(90deg,#1a1a1a 25%,#2a2a2a 50%,#1a1a1a 75%)', backgroundSize: '400px', animation: 'shimmer 1.5s infinite', marginBottom: '10px' }} />
                                <div style={{ height: '14px', borderRadius: '4px', background: '#1a1a1a', marginBottom: '6px' }} />
                            </div>
                        ))}
                    </div>
                )}
                {albums.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px', color: '#a7a7a7' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💿</div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Couldn't load albums</p>
                        <p style={{ fontSize: '13px', marginBottom: '20px' }}>saavn.dev API may be temporarily unavailable</p>
                        <button onClick={loadAlbums} style={{ padding: '12px 28px', background: '#1DB954', border: 'none', borderRadius: '500px', color: '#000', fontWeight: 800, cursor: 'pointer' }}>🔄 Try Again</button>
                    </div>
                )}
            </div>
        </div>
    );
}
