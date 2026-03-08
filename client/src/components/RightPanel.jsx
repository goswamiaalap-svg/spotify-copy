// client/src/components/RightPanel.jsx — COMPLETE REWRITE
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { usePlayerStore } from '../store/playerStore';

const tabs = ['Now Playing', 'Queue', 'Lyrics', 'Visualizer', 'AI Vibe'];

export default function RightPanel({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('Now Playing');
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [timedLines, setTimedLines] = useState([]); // [{time: 12.5, text: "some line"}]
    const [plainLines, setPlainLines] = useState([]); // fallback plain lines
    const [currentLine, setCurrentLine] = useState(0);
    const [isLrcSynced, setIsLrcSynced] = useState(false);

    const [videoMode, setVideoMode] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);

    const [liked, setLiked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');

    const lyricsRef = useRef(null);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const { currentSong, queue, currentIndex, isPlaying, progress, duration } = usePlayerStore();

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // Parse LRC format: "[01:23.45] lyric line"
    const parseLRC = (lrc) => {
        const lines = [];
        const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
        let match;
        while ((match = regex.exec(lrc)) !== null) {
            const mins = parseInt(match[1]);
            const secs = parseInt(match[2]);
            const ms = parseInt(match[3].padEnd(3, '0'));
            const time = mins * 60 + secs + ms / 1000;
            const text = match[4].trim();
            if (text) lines.push({ time, text });
        }
        return lines;
    };

    const fetchLyrics = async () => {
        if (!currentSong) return;
        setLyricsLoading(true);
        setTimedLines([]);
        setPlainLines([]);
        setIsLrcSynced(false);

        const cleanTitle = currentSong.title
            .replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '')
            .replace(/- Trending.*/i, '').replace(/&quot;/g, '')
            .replace(/- Acoustic.*/i, '').replace(/- Official.*/i, '').trim();
        const cleanArtist = currentSong.artist.split(',')[0].trim();

        // ── ATTEMPT 1: lrclib synced LRC (has real timestamps) ──
        try {
            const r = await axios.get(
                `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`,
                { timeout: 8000 }
            );
            const best = (r.data || []).find(x => x.syncedLyrics?.length > 30);
            if (best?.syncedLyrics) {
                const timed = parseLRC(best.syncedLyrics);
                if (timed.length > 3) {
                    setTimedLines(timed);
                    setIsLrcSynced(true);
                    setLyricsLoading(false);
                    return;
                }
            }
            // Has plain lyrics at least
            const bestPlainEntry = (r.data || []).find(x => x.plainLyrics?.length > 30);
            if (bestPlainEntry?.plainLyrics) {
                setPlainLines(bestPlainEntry.plainLyrics.split('\n').filter(l => l.trim()));
                setLyricsLoading(false);
                return;
            }
        } catch { }

        // ── ATTEMPT 2: lrclib title only ──
        try {
            const r = await axios.get(
                `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}`,
                { timeout: 6000 }
            );
            const best = (r.data || []).find(x => x.syncedLyrics?.length > 30);
            if (best?.syncedLyrics) {
                const timed = parseLRC(best.syncedLyrics);
                if (timed.length > 3) { setTimedLines(timed); setIsLrcSynced(true); setLyricsLoading(false); return; }
            }
            const bestPlain = (r.data || []).find(x => x.plainLyrics?.length > 30);
            if (bestPlain?.plainLyrics) {
                setPlainLines(bestPlain.plainLyrics.split('\n').filter(l => l.trim()));
                setLyricsLoading(false);
                return;
            }
        } catch { }

        // ── ATTEMPT 3: lyrics.ovh ──
        try {
            const r = await axios.get(
                `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`,
                { timeout: 6000 }
            );
            if (r.data?.lyrics?.trim().length > 30) {
                setPlainLines(r.data.lyrics.trim().split('\n').filter(l => l.trim()));
                setLyricsLoading(false);
                return;
            }
        } catch { }

        // ── FALLBACK: placeholder ──
        setPlainLines([
            `♪ ${cleanTitle}`,
            `— ${cleanArtist} —`,
            '',
            'Lyrics not found in any database',
            'for this song.',
            '',
            'Feel the music...',
            'Let the melody speak.',
            '',
            `♪ ${cleanTitle} ♪`,
        ]);
        setLyricsLoading(false);
    };

    const switchToVideo = async () => {
        if (videoId) { setVideoMode(true); return; }
        setVideoLoading(true);

        const title = currentSong.title
            .replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '')
            .replace(/- Trending.*/i, '').replace(/&quot;/g, '').trim();
        const artist = currentSong.artist.split(',')[0].trim();
        const query = `${title} ${artist} official video`;

        try {
            // Call our own Vercel serverless function — no CORS issues
            const res = await fetch(`/api/video?q=${encodeURIComponent(query)}`, {
                signal: AbortSignal.timeout(12000)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.videoId?.length === 11) {
                    setVideoId(data.videoId);
                    setVideoMode(true);
                    setVideoLoading(false);
                    return;
                }
            }
        } catch (e) { console.warn('Video API failed:', e.message); }

        // Fallback — just open YouTube search
        setVideoId(`FALLBACK:${encodeURIComponent(query)}`);
        setVideoMode(true);
        setVideoLoading(false);
    };

    // Like state logic
    useEffect(() => {
        if (!currentSong) return;
        const list = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        setLiked(list.some(s => s.id === currentSong.id));
        setTimedLines([]);
        setPlainLines([]);
        setIsLrcSynced(false);
        setVideoMode(false);
        setVideoId(null);
    }, [currentSong?.id]);

    // Lyrics fetch trigger
    useEffect(() => {
        if (activeTab === 'Lyrics' && currentSong && timedLines.length === 0 && plainLines.length === 0) fetchLyrics();
    }, [activeTab, currentSong?.id]);

    // Sync lyric line with progress
    useEffect(() => {
        if (isLrcSynced && timedLines.length > 0) {
            let idx = 0;
            for (let i = 0; i < timedLines.length; i++) {
                if (timedLines[i].time <= progress + 0.5) idx = i;
                else break;
            }
            if (idx !== currentLine) {
                setCurrentLine(idx);
                document.getElementById(`ll-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else if (plainLines.length > 0) {
            if (!duration) return;
            const idx = Math.min(Math.floor((progress / duration) * plainLines.length), plainLines.length - 1);
            if (idx !== currentLine) {
                setCurrentLine(idx);
                document.getElementById(`ll-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [progress, timedLines, plainLines, isLrcSynced, duration, currentLine]);

    // Canvas Visualizer Logic
    useEffect(() => {
        if (activeTab !== 'Visualizer' || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame = 0;

        const draw = () => {
            frame++;
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H);
            bg.addColorStop(0, '#1a1a2e');
            bg.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            if (isPlaying) {
                const bars = 48;
                const barW = (W - 32) / bars;
                for (let i = 0; i < bars; i++) {
                    const t = frame * 0.05 + i * 0.3;
                    const h = (Math.sin(t) * 0.5 + 0.5) * (H * 0.6) + 8;
                    const x = 16 + i * barW;
                    const y = H / 2 - h / 2;
                    const grad = ctx.createLinearGradient(0, y, 0, y + h);
                    grad.addColorStop(0, '#1DB954');
                    grad.addColorStop(0.5, '#1ed760');
                    grad.addColorStop(1, 'rgba(29,185,84,0.2)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(x, y, barW - 3, h, 3);
                    else ctx.rect(x, y, barW - 3, h);
                    ctx.fill();
                }
                for (let i = 0; i < 5; i++) {
                    const angle = (frame * 0.02) + (i * Math.PI * 2 / 5);
                    const r = H * 0.28;
                    const cx = W / 2 + Math.cos(angle) * r;
                    const cy = H / 2 + Math.sin(angle) * (r * 0.4);
                    const size = 4 + Math.sin(frame * 0.08 + i) * 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(29,185,84,${0.3 + Math.sin(frame * 0.06 + i) * 0.2})`;
                    ctx.fill();
                }
                const pulse = Math.sin(frame * 0.08) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(W / 2, H / 2, 30 + pulse * 15, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(29,185,84,${0.4 + pulse * 0.3})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(currentSong?.title?.slice(0, 20) || '', W / 2, H / 2 + 5);
            } else {
                ctx.strokeStyle = 'rgba(29,185,84,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const y = H / 2 + Math.sin(x * 0.05) * 20;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.fillStyle = '#a7a7a7';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Paused', W / 2, H / 2 + 40);
            }
            animRef.current = requestAnimationFrame(draw);
        };
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [activeTab, isPlaying, currentSong]);

    const handleLike = () => {
        if (!currentSong) return;
        const list = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        if (liked) {
            localStorage.setItem('likedSongs', JSON.stringify(list.filter(s => s.id !== currentSong.id)));
            setLiked(false); showToast('💔 Removed from Liked Songs');
        } else {
            list.unshift(currentSong);
            localStorage.setItem('likedSongs', JSON.stringify(list));
            setLiked(true); showToast('❤️ Added to Liked Songs');
        }
    };

    const handleShare = async () => {
        if (!currentSong) return;
        await navigator.clipboard.writeText(`🎵 ${currentSong.title} — ${currentSong.artist}`).catch(() => { });
        setCopied(true); showToast('✅ Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            {toast && (
                <div style={{ position: 'fixed', bottom: '110px', right: '340px', background: '#282828', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999, animation: 'fadeSlideUp 0.3s ease' }}>{toast}</div>
            )}

            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#282828', borderRadius: '16px', padding: '32px', width: '360px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '20px' }}>Add to Playlist</h3>
                        {(() => {
                            const pls = JSON.parse(localStorage.getItem('playlists') || '[]');
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {pls.map(pl => (
                                        <button key={pl.id} onClick={() => {
                                            if (!pl.songs?.some(s => s.id === currentSong.id)) {
                                                pl.songs = [...(pl.songs || []), currentSong];
                                                localStorage.setItem('playlists', JSON.stringify(pls.map(p => p.id === pl.id ? pl : p)));
                                                showToast(`✅ Added to "${pl.name}"`);
                                            } else showToast(`Already in "${pl.name}"`);
                                            setShowModal(false);
                                        }} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: 500 }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        >📋 {pl.name} ({pl.songs?.length || 0})</button>
                                    ))}
                                    <button onClick={() => {
                                        const name = prompt('Playlist name?');
                                        if (!name) return;
                                        const pls2 = JSON.parse(localStorage.getItem('playlists') || '[]');
                                        pls2.push({ id: Date.now(), name, songs: [currentSong] });
                                        localStorage.setItem('playlists', JSON.stringify(pls2));
                                        setShowModal(false); showToast(`✅ Created "${name}"`);
                                    }} style={{ padding: '12px 16px', background: '#1DB954', border: 'none', borderRadius: '10px', color: '#000', cursor: 'pointer', fontWeight: 800, fontSize: '14px' }}>+ Create New</button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            <div style={{ width: '320px', minWidth: '320px', background: '#121212', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.2s ease', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 8px', border: 'none', background: 'transparent', color: activeTab === tab ? '#fff' : '#a7a7a7', fontSize: '11px', fontWeight: 700, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #1DB954' : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>{tab}</button>
                    ))}
                    <button onClick={onClose} style={{ marginLeft: 'auto', flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 700, margin: '0 8px', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {activeTab === 'Now Playing' && (
                        !currentSong ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#a7a7a7' }}>
                                <div style={{ fontSize: '56px' }}>🎵</div>
                                <p style={{ color: '#fff', fontWeight: 700, marginTop: '16px' }}>Nothing playing</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'relative', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                                    {videoMode && videoId ? (
                                        // ── VIDEO VIEW ──
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', background: '#000' }}>
                                            {!videoId.startsWith('FALLBACK:') ? (
                                                <iframe
                                                    key={videoId}
                                                    width="100%" height="175"
                                                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                                                    title="Music Video"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                                    allowFullScreen
                                                    style={{ display: 'block' }}
                                                />
                                            ) : (
                                                <div style={{ height: '175px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#111' }}>
                                                    <p style={{ color: '#a7a7a7', fontSize: '12px' }}>Direct embed unavailable</p>
                                                    <a
                                                        href={`https://www.youtube.com/results?search_query=${videoId.replace('FALLBACK:', '')}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        style={{ padding: '9px 22px', background: '#ff0000', color: '#fff', borderRadius: '500px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}
                                                    >▶ Watch on YouTube</a>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.9)' }}>
                                                <button onClick={() => { setVideoMode(false); setVideoId(null); }}
                                                    style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                                                    🎵 Back to artwork
                                                </button>
                                                {!videoId.startsWith('FALLBACK:') && (
                                                    <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
                                                        style={{ flex: 1, padding: '7px', background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', color: '#ff6666', fontSize: '12px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                                                        ▶ YouTube
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // ── ALBUM ART VIEW ──
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', inset: '-24px', background: 'radial-gradient(circle,rgba(29,185,84,0.1) 0%,transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
                                            <img
                                                src={currentSong.albumArt} alt=""
                                                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', display: 'block' }}
                                                onError={e => e.target.style.display = 'none'}
                                            />

                                            {/* EQ bars when playing */}
                                            {isPlaying && (
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '20px' }}>
                                                    {[14, 20, 12, 18, 10].map((h, i) => (
                                                        <div key={i} style={{ width: '3px', height: `${h}px`, background: '#1DB954', borderRadius: '2px', animation: `eq${(i % 3) + 1} ${0.5 + i * 0.08}s ease infinite alternate`, animationDelay: `${i * 0.1}s` }} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* TRENDING badge */}
                                            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '500px', fontSize: '10px', fontWeight: 700, color: '#1DB954', border: '1px solid rgba(29,185,84,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                🔥 TRENDING NOW
                                            </div>

                                            {/* ✅ SWITCH TO VIDEO BUTTON */}
                                            <button
                                                onClick={switchToVideo}
                                                disabled={videoLoading}
                                                style={{
                                                    position: 'absolute', bottom: '12px', right: '12px',
                                                    background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)',
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                    color: '#fff', padding: '7px 13px',
                                                    borderRadius: '500px', fontSize: '11px', fontWeight: 700,
                                                    cursor: videoLoading ? 'wait' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                                                    transition: 'all 0.2s',
                                                    opacity: videoLoading ? 0.7 : 1,
                                                    pointerEvents: videoLoading ? 'none' : 'auto',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,30,30,0.95)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.82)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                {videoLoading ? (
                                                    <>
                                                        <div style={{ width: '11px', height: '11px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                                                        Finding video...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                                                            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13l-5-5 1.41-1.41L12 13.17l7.59-7.59L21 7l-9 9z" />
                                                        </svg>
                                                        Switch to video
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{currentSong.title}</h3>
                                    <p style={{ color: '#a7a7a7', fontSize: '14px' }}>{currentSong.artist}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                                    {[
                                        { icon: liked ? '❤️' : '🤍', label: liked ? 'Liked' : 'Like', onClick: handleLike, active: liked },
                                        { icon: '➕', label: 'Playlist', onClick: () => setShowModal(true), active: false },
                                        { icon: copied ? '✅' : '📤', label: copied ? 'Copied!' : 'Share', onClick: handleShare, active: copied },
                                        { icon: '📻', label: 'Radio', onClick: () => showToast(`📻 ${currentSong.artist} Radio...`), active: false },
                                    ].map(btn => (
                                        <button key={btn.label} onClick={btn.onClick} style={{ padding: '16px 8px', background: btn.active ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${btn.active ? 'rgba(29,185,84,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: btn.active ? '#1DB954' : '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}
                                            onMouseEnter={e => { if (!btn.active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                            onMouseLeave={e => { if (!btn.active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                        >
                                            <span style={{ fontSize: '22px' }}>{btn.icon}</span>{btn.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )
                    )}

                    {activeTab === 'Queue' && (
                        <div>
                            {currentSong && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#1DB954', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Now Playing</div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'rgba(29,185,84,0.07)', borderRadius: '8px', border: '1px solid rgba(29,185,84,0.15)' }}>
                                        <img src={currentSong.albumArt} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: '#1DB954', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</div>
                                            <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{currentSong.artist}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {queue.slice(currentIndex + 1, currentIndex + 12).map((song, i) => (
                                <div key={song.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                    <span style={{ color: '#6a6a6a', fontSize: '11px', width: '14px' }}>{i + 1}</span>
                                    <img src={song.albumArt} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                                        <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{song.artist}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Lyrics' && (
                        <div>
                            {lyricsLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ color: '#a7a7a7' }}>Finding lyrics...</p>
                                </div>
                            ) : (timedLines.length > 0 || plainLines.length > 0) ? (
                                <div ref={lyricsRef}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '16px', background: 'rgba(29,185,84,0.07)', border: '1px solid rgba(29,185,84,0.15)', borderRadius: '10px' }}>
                                        <img src={currentSong?.albumArt} alt="" style={{ width: '32px', height: '32px', borderRadius: '5px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: '#1DB954', fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong?.title}</p>
                                            <p style={{ color: '#a7a7a7', fontSize: '11px' }}>{currentSong?.artist}</p>
                                        </div>
                                        <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '500px', background: isLrcSynced ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.08)', color: isLrcSynced ? '#1DB954' : '#a7a7a7', fontWeight: 700, flexShrink: 0 }}>
                                            {isLrcSynced ? '⚡ SYNCED' : 'STATIC'}
                                        </span>
                                    </div>
                                    <div style={{ paddingBottom: '60px' }}>
                                        {(isLrcSynced ? timedLines : plainLines).map((item, i) => {
                                            const text = isLrcSynced ? item.text : item;
                                            if (!text?.trim()) return <div key={i} style={{ height: '12px' }} />;
                                            const isActive = i === currentLine;
                                            const isNear = Math.abs(i - currentLine) <= 1;
                                            return (
                                                <div id={`ll-${i}`} key={i} style={{
                                                    padding: isActive ? '8px 14px' : '5px 14px',
                                                    marginBottom: '3px',
                                                    borderRadius: '10px',
                                                    fontSize: isActive ? '16px' : '14px',
                                                    fontWeight: isActive ? 800 : isNear ? 500 : 400,
                                                    color: isActive ? '#ffffff' : isNear ? '#c8c8c8' : '#3a3a3a',
                                                    background: isActive ? 'rgba(29,185,84,0.13)' : 'transparent',
                                                    borderLeft: `3px solid ${isActive ? '#1DB954' : 'transparent'}`,
                                                    lineHeight: '1.65',
                                                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                                                    textShadow: isActive ? '0 0 24px rgba(29,185,84,0.5)' : 'none',
                                                    letterSpacing: isActive ? '0.2px' : '0',
                                                    cursor: 'default',
                                                }}>
                                                    {text}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎤</div>
                                    <p style={{ color: '#fff', fontWeight: 700 }}>No lyrics found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Visualizer' && (
                        <div>
                            <canvas ref={canvasRef} width={280} height={280}
                                style={{ width: '100%', height: '280px', borderRadius: '16px', background: '#0a0a1a', display: 'block' }}
                            />
                        </div>
                    )}

                    {activeTab === 'AI Vibe' && (
                        <div>
                            {currentSong ? (
                                <>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                                        {['🎵 Melodic', '❤️ Romantic', '🌙 Night Vibe', '✨ Emotional', '🔥 Trending'].map(m => (
                                            <span key={m} style={{ padding: '6px 12px', borderRadius: '500px', fontSize: '11px', fontWeight: 600, background: 'rgba(29,185,84,0.1)', color: '#1DB954', border: '1px solid rgba(29,185,84,0.2)' }}>{m}</span>
                                        ))}
                                    </div>
                                    {[{ label: 'Energy', value: 72, color: '#f59e0b' }, { label: 'Mood', value: 88, color: '#1DB954' }, { label: 'Danceability', value: 60, color: '#8b5cf6' }, { label: 'Popularity', value: 92, color: '#ec4899' }].map(b => (
                                        <div key={b.label} style={{ marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ color: '#a7a7a7', fontSize: '12px' }}>{b.label}</span>
                                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{b.value}%</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                                                <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: '2px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : <p style={{ color: '#a7a7a7', textAlign: 'center', padding: '40px 0' }}>Play a song to see AI analysis</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
