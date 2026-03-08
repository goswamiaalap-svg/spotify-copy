import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

export default function MobilePlayer() {
    const { currentSong, isPlaying, togglePlay, playNext, playPrev, progress, duration, seekTo } = usePlayerStore();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showFull, setShowFull] = useState(false);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);

    if (!isMobile || !currentSong) return null;

    const pct = duration > 0 ? (progress / duration) * 100 : 0;
    const fmt = s => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';

    // Full screen player
    if (showFull) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'linear-gradient(180deg, #1a2a1a 0%, #121212 40%)',
                display: 'flex', flexDirection: 'column',
                padding: '0 24px', paddingTop: 'env(safe-area-inset-top)',
            }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                    <button onClick={() => setShowFull(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>⌄</button>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Now Playing</span>
                    <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>⋯</button>
                </div>

                {/* Album art */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                    <img src={currentSong.albumArt} alt=""
                        style={{ width: '100%', maxWidth: '320px', aspectRatio: '1/1', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
                        onError={e => e.target.style.display = 'none'} />
                </div>

                {/* Song info + like */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: '22px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</div>
                        <div style={{ color: '#a7a7a7', fontSize: '15px', marginTop: '4px' }}>{currentSong.artist}</div>
                    </div>
                    <button onClick={() => {
                        const list = JSON.parse(localStorage.getItem('likedSongs') || '[]');
                        const isLiked = list.some(s => s.id === currentSong.id);
                        if (isLiked) localStorage.setItem('likedSongs', JSON.stringify(list.filter(s => s.id !== currentSong.id)));
                        else { list.unshift(currentSong); localStorage.setItem('likedSongs', JSON.stringify(list)); }
                    }} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', padding: '8px', marginLeft: '16px' }}>
                        {JSON.parse(localStorage.getItem('likedSongs') || '[]').some(s => s.id === currentSong.id) ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                    <div
                        onClick={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            seekTo(((e.clientX - rect.left) / rect.width) * duration);
                        }}
                        style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer', position: 'relative', marginBottom: '8px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#1DB954', borderRadius: '2px' }}>
                            <div style={{ position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a7a7a7', fontSize: '11px' }}>{fmt(progress)}</span>
                        <span style={{ color: '#a7a7a7', fontSize: '11px' }}>{fmt(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#a7a7a7', fontSize: '24px', cursor: 'pointer', padding: '8px' }}>🔀</button>
                    <button onClick={playPrev} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', padding: '8px' }}>⏮</button>
                    <button onClick={togglePlay} style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                    }}>{isPlaying ? '⏸' : '▶'}</button>
                    <button onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', padding: '8px' }}>⏭</button>
                    <button style={{ background: 'none', border: 'none', color: '#a7a7a7', fontSize: '24px', cursor: 'pointer', padding: '8px' }}>🔁</button>
                </div>

                {/* Extra actions */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '32px' }}>
                    {[['📻', 'Radio'], ['➕', 'Add'], ['📤', 'Share'], ['🎤', 'Lyrics']].map(([icon, label]) => (
                        <button key={label} style={{ background: 'none', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                            <span style={{ fontSize: '22px' }}>{icon}</span>{label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Mini player bar (above bottom nav)
    return (
        <div style={{
            position: 'fixed', bottom: '56px', left: '8px', right: '8px',
            background: '#282828', borderRadius: '10px',
            padding: '10px 12px', zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            {/* Progress line at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px 10px 0 0' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#1DB954', borderRadius: 'inherit', transition: 'width 0.5s linear' }} />
            </div>

            {/* Tap to open full player */}
            <div onClick={() => setShowFull(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <img src={currentSong.albumArt} alt=""
                    style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => e.target.style.display = 'none'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</div>
                    <div style={{ color: '#a7a7a7', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.artist}</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); playPrev(); }}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '6px' }}>⏮</button>
                <button onClick={e => { e.stopPropagation(); togglePlay(); }}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', padding: '6px' }}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={e => { e.stopPropagation(); playNext(); }}
                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '6px' }}>⏭</button>
            </div>
        </div>
    );
}
