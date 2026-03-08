import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/SongRow';

// Verified working endpoint
const SAAVN = 'https://jiosaavn-api-privatecvc2.vercel.app';

export default function Home() {
    const [trending, setTrending] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayerStore();

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return '☀️ Good morning';
        if (h < 17) return '🌤️ Good afternoon';
        return '🌙 Good evening';
    };

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [r1, r2, r3, r4] = await Promise.allSettled([
                axios.get(`${SAAVN}/search/songs?query=trending+hindi+2024&limit=20`),
                axios.get(`${SAAVN}/search/songs?query=top+bollywood+hits&limit=10`),
                axios.get(`${SAAVN}/search/songs?query=new+releases+2024&limit=10`),
                axios.get(`${SAAVN}/search/songs?query=arijit+singh+best&limit=10`),
            ]);

            const parse = (r) => {
                if (r.status === 'fulfilled') {
                    const results = r.value.data?.data?.results || r.value.data?.results || [];
                    return results.map(s => ({
                        id: s.id,
                        title: s.name,
                        artist: s.primaryArtists || (s.artists?.primary?.[0]?.name) || 'Unknown Artist',
                        album: s.album?.name || s.album || '',
                        albumArt: s.image?.[2]?.link || s.image?.[2]?.url || s.image || '',
                        duration: s.duration,
                        downloadUrl: s.downloadUrl,
                        source: 'saavn'
                    }));
                }
                return [];
            };

            const t = parse(r1);
            setTrending(t);
            setFeatured(t.slice(0, 6));
            setNewReleases(parse(r3).slice(0, 6));
        } catch (e) {
            console.error('Home fetch error:', e);
        }
        setLoading(false);
    };

    const SkeletonRow = ({ index }) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '40px 48px 1fr 1fr 80px 40px', gap: '12px', padding: '8px 16px', alignItems: 'center' }}>
            {[32, 48, 200, 150, 50, 30].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: i === 1 ? '40px' : '14px', width: i === 1 ? '40px' : `${w}px` }} />
            ))}
        </div>
    );

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '32px' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(180deg, #1e3a2a 0%, #121212 100%)',
                padding: '32px 32px 24px',
                position: 'relative'
            }}>
                <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                    {getGreeting()}
                </h1>

                {/* Featured 2x3 grid */}
                <div className="featured-grid" style={{ display: 'grid', gap: '16px' }}>
                    {loading
                        ? Array(6).fill(0).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '6px' }} />
                        ))
                        : featured.map(song => (
                            <div key={song.id} onClick={() => playSong(song, trending)}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', height: '64px', transition: 'background 0.2s' }}>
                                <img src={song.albumArt} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>{song.title}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Trending Now */}
            <div className="home-content-section" style={{ padding: '24px 32px 0' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>🔥 Trending Now</h2>
                <div className="song-list-header" style={{ display: 'grid', gap: '12px', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                    {['#', '', 'TITLE', 'ALBUM', 'TIME', ''].map((h, i) => (
                        <span key={i} className={`header-col-${i}`} style={{ fontSize: '11px', fontWeight: 700, color: '#a7a7a7', letterSpacing: '1px', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
                    ))}
                </div>
                {loading
                    ? Array(10).fill(0).map((_, i) => <SkeletonRow key={i} index={i} />)
                    : trending.map((song, i) => (
                        <SongRow key={song.id} song={song} index={i} queue={trending} />
                    ))
                }
            </div>
        </div>
    );
}
