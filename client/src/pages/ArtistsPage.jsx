// client/src/pages/ArtistsPage.jsx — COMPLETE
import { useState, useRef } from 'react';
import axios from 'axios';
import { usePlayerStore } from '../store/playerStore';

const SAAVN = 'https://saavn.dev/api';

const FEATURED_ARTISTS = [
    { name: 'Arijit Singh', queries: ['arijit singh tum hi ho', 'arijit singh channa mereya', 'arijit singh'], color: '#e91429', emoji: '🎤' },
    { name: 'Shreya Ghoshal', queries: ['shreya ghoshal teri meri', 'shreya ghoshal sun raha hai', 'shreya ghoshal'], color: '#1e3264', emoji: '🎶' },
    { name: 'Pritam', queries: ['pritam ae dil hai mushkil', 'pritam love aaj kal', 'pritam'], color: '#8d67ab', emoji: '🎸' },
    { name: 'A.R. Rahman', queries: ['ar rahman jai ho', 'ar rahman vande mataram', 'ar rahman'], color: '#e8115b', emoji: '🎹' },
    { name: 'Diljit Dosanjh', queries: ['diljit dosanjh lover', 'diljit dosanjh do you know', 'diljit dosanjh'], color: '#ba5d07', emoji: '🎵' },
    { name: 'Neha Kakkar', queries: ['neha kakkar o saathi', 'neha kakkar dilbar', 'neha kakkar'], color: '#1e3264', emoji: '💃' },
    { name: 'Atif Aslam', queries: ['atif aslam tere sang yaara', 'atif aslam dastaan e om shanti', 'atif aslam'], color: '#0d73ec', emoji: '🎙️' },
    { name: 'Badshah', queries: ['badshah paagal', 'badshah genda phool', 'badshah'], color: '#148a08', emoji: '👑' },
    { name: 'Jubin Nautiyal', queries: ['jubin nautiyal tum hi aana', 'jubin nautiyal lut gaye', 'jubin nautiyal'], color: '#27856a', emoji: '🎵' },
    { name: 'Armaan Malik', queries: ['armaan malik bol do na zara', 'armaan malik main hoon', 'armaan malik'], color: '#e8a029', emoji: '✨' },
    { name: 'KK', queries: ['kk yaaron', 'kk pal', 'kk singer'], color: '#503750', emoji: '🎸' },
    { name: 'Sonu Nigam', queries: ['sonu nigam kal ho na ho', 'sonu nigam abhi mujh mein kahin', 'sonu nigam'], color: '#dc148c', emoji: '🎤' },
];

function parseSongs(results) {
    return (results || []).map(s => ({
        id: s.id, title: s.name,
        artist: s.artists?.primary?.map(a => a.name).join(', ') || 'Unknown',
        album: s.album?.name || '',
        albumArt: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || '',
        duration: s.duration, downloadUrl: s.downloadUrl, source: 'saavn'
    }));
}

export default function ArtistsPage() {
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loadingArtist, setLoadingArtist] = useState(null);
    const [error, setError] = useState('');
    const [searchQ, setSearchQ] = useState('');
    const [searchSongs, setSearchSongs] = useState([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef(null);
    const { playSong } = usePlayerStore();

    const handleArtistClick = async (artist) => {
        if (loadingArtist) return;
        setLoadingArtist(artist.name);
        setSelectedArtist(artist);
        setSongs([]);
        setError('');

        for (const q of artist.queries) {
            try {
                const res = await axios.get(
                    `${SAAVN}/search/songs?query=${encodeURIComponent(q)}&limit=20`,
                    { timeout: 20000 }
                );
                const results = res.data?.data?.results;
                if (results?.length > 0) {
                    setSongs(parseSongs(results));
                    setLoadingArtist(null);
                    return;
                }
            } catch (e) { console.warn('Failed query:', q); }
        }
        setError('Could not load. Check connection.');
        setLoadingArtist(null);
    };

    const handleSearch = (q) => {
        setSearchQ(q);
        clearTimeout(debounceRef.current);
        if (!q.trim()) { setSearchSongs([]); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await axios.get(`${SAAVN}/search/songs?query=${encodeURIComponent(q)}&limit=20`, { timeout: 15000 });
                setSearchSongs(parseSongs(res.data?.data?.results));
            } catch { setSearchSongs([]); }
            setSearching(false);
        }, 500);
    };

    const fmt = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(180deg,#1a1a2e 0%,#121212 100%)', padding: '32px 32px 24px' }}>
                <h1 style={{ color: '#fff', fontSize: '40px', fontWeight: 900, marginBottom: '20px' }}>🎤 Artists</h1>
                <div style={{ position: 'relative', maxWidth: '440px' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
                    <input value={searchQ} onChange={e => handleSearch(e.target.value)}
                        placeholder="Search artists or songs..."
                        style={{ width: '100%', height: '46px', padding: '0 44px', background: 'rgba(255,255,255,0.1)', border: '2px solid transparent', borderRadius: '500px', color: '#fff', fontSize: '14px', outline: 'none', caretColor: '#1DB954', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(29,185,84,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                    />
                    {searchQ && <button onClick={() => { setSearchQ(''); setSearchSongs([]); }} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a7a7a7', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
                </div>
            </div>
            <div style={{ padding: '0 32px' }}>
                {searchQ ? (
                    <>
                        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{searching ? 'Searching...' : `"${searchQ}"`}</h2>
                        {searchSongs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={searchSongs} playSong={playSong} fmt={fmt} />)}
                    </>
                ) : (
                    <>
                        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '20px', marginTop: '8px' }}>Featured Artists</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '16px', marginBottom: '40px' }}>
                            {FEATURED_ARTISTS.map(artist => (
                                <div key={artist.name} onClick={() => handleArtistClick(artist)}
                                    style={{ cursor: 'pointer', textAlign: 'center', padding: '20px 12px', borderRadius: '12px', background: selectedArtist?.name === artist.name ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.04)', border: `2px solid ${selectedArtist?.name === artist.name ? '#1DB954' : 'transparent'}`, transition: 'all 0.2s' }}
                                    onMouseEnter={e => { if (selectedArtist?.name !== artist.name) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                                    onMouseLeave={e => { if (selectedArtist?.name !== artist.name) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                >
                                    <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: artist.color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: selectedArtist?.name === artist.name ? '0 0 24px rgba(29,185,84,0.5)' : '0 4px 16px rgba(0,0,0,0.4)' }}>
                                        {loadingArtist === artist.name
                                            ? <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                            : artist.emoji}
                                    </div>
                                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{artist.name}</div>
                                    <div style={{ color: '#a7a7a7', fontSize: '11px' }}>Artist</div>
                                </div>
                            ))}
                        </div>

                        {selectedArtist && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>🎵 {selectedArtist.name}</h2>
                                    {songs.length > 0 && (
                                        <>
                                            <span style={{ color: '#a7a7a7', fontSize: '13px' }}>{songs.length} songs</span>
                                            <button onClick={() => playSong(songs[0], songs)} style={{ marginLeft: 'auto', padding: '10px 28px', background: '#1DB954', border: 'none', borderRadius: '500px', color: '#000', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>▶ Play All</button>
                                        </>
                                    )}
                                </div>
                                {loadingArtist === selectedArtist.name ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.7s linear infinite' }} />
                                        <p style={{ color: '#a7a7a7' }}>Loading songs for {selectedArtist.name}...</p>
                                    </div>
                                ) : error ? (
                                    <div style={{ textAlign: 'center', padding: '32px' }}>
                                        <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
                                        <button onClick={() => handleArtistClick(selectedArtist)} style={{ padding: '10px 24px', background: '#1DB954', border: 'none', borderRadius: '500px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>🔄 Retry</button>
                                    </div>
                                ) : songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} playSong={playSong} fmt={fmt} />)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function SongRow({ song, index, queue, playSong, fmt }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div onClick={() => playSong(song, queue)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.15s', marginBottom: '2px' }}>
            <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {hovered ? <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '11px', fontWeight: 900 }}>▶</div>
                    : <span style={{ color: '#a7a7a7', fontSize: '13px' }}>{index + 1}</span>}
            </div>
            <img src={song.albumArt} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{song.album}</div>
            </div>
            <div style={{ color: '#a7a7a7', fontSize: '13px', flexShrink: 0 }}>{fmt(song.duration)}</div>
        </div>
    );
}
