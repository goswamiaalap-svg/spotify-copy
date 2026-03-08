import { useState, useRef, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';

export default function PlayerBar({ isRightPanelOpen, setIsRightPanelOpen }) {
    const {
        currentSong, isPlaying, isLoading,
        progress, duration, volume,
        togglePlay, playNext, playPrev,
        seekTo, setVolume
    } = usePlayerStore();

    const progressBarRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverPct, setHoverPct] = useState(null);

    const getPctFromEvent = (e) => {
        const rect = progressBarRef.current?.getBoundingClientRect();
        if (!rect) return 0;
        return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    };

    const handleProgressClick = (e) => {
        if (!duration) return;
        const pct = getPctFromEvent(e);
        seekTo(pct * duration);
    };

    const handleMouseDown = (e) => {
        if (!duration) return;
        setIsDragging(true);
        const pct = getPctFromEvent(e);
        seekTo(pct * duration);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !duration) return;
            const pct = getPctFromEvent(e);
            seekTo(pct * duration);
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, duration, seekTo]);

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="player-bar-container" style={{
            height: '90px', background: '#181818',
            borderTop: '1px solid #282828',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: '16px',
            flexShrink: 0, zIndex: 100
        }}>

            {/* LEFT — Song info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '240px', minWidth: '180px' }}>
                {currentSong ? (
                    <>
                        <SongImage
                            src={currentSong.albumArt}
                            source={currentSong.source}
                            size={56}
                            radius={6}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                                color: '#fff', fontSize: '14px', fontWeight: '600',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>{currentSong.title}</div>
                            <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{currentSong.artist}</div>
                        </div>
                    </>
                ) : (
                    <div style={{ color: '#a7a7a7', fontSize: '13px' }}>Select a song to play</div>
                )}
            </div>

            {/* CENTER — Controls */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button onClick={playPrev} style={{ color: '#b3b3b3', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>⏮</button>
                    <button
                        onClick={togglePlay}
                        disabled={!currentSong || isLoading}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            // ✅ White background with BLACK icon — always visible
                            background: !currentSong ? 'rgba(255,255,255,0.3)' : '#ffffff',
                            border: 'none',
                            cursor: currentSong ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'transform 0.1s',
                            boxShadow: currentSong ? '0 2px 12px rgba(0,0,0,0.4)' : 'none'
                        }}
                        onMouseEnter={e => { if (currentSong) e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {isLoading ? (
                            // Spinner
                            <div style={{
                                width: '18px', height: '18px',
                                border: '2px solid rgba(0,0,0,0.2)',
                                borderTopColor: '#000',
                                borderRadius: '50%',
                                animation: 'spin 0.7s linear infinite'
                            }} />
                        ) : isPlaying ? (
                            // Pause icon — two black bars
                            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <div style={{ width: '3px', height: '14px', background: '#000', borderRadius: '2px' }} />
                                <div style={{ width: '3px', height: '14px', background: '#000', borderRadius: '2px' }} />
                            </div>
                        ) : (
                            // Play icon — black triangle
                            <div style={{
                                width: 0, height: 0,
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderLeft: '14px solid #000',
                                marginLeft: '3px'
                            }} />
                        )}
                    </button>
                    <button onClick={playNext} style={{ color: '#b3b3b3', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>⏭</button>
                </div>

                {/* Seekable Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '600px' }}>
                    <span style={{ color: '#a7a7a7', fontSize: '11px', minWidth: '36px', textAlign: 'right' }}>
                        {formatTime(progress)}
                    </span>

                    {/* Track bar */}
                    <div
                        ref={progressBarRef}
                        onMouseDown={handleMouseDown}
                        onClick={handleProgressClick}
                        onMouseMove={e => {
                            const rect = progressBarRef.current?.getBoundingClientRect();
                            if (rect) setHoverPct((e.clientX - rect.left) / rect.width * 100);
                        }}
                        onMouseLeave={() => setHoverPct(null)}
                        style={{
                            flex: 1, height: isDragging || hoverPct !== null ? '6px' : '4px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '3px', cursor: 'pointer',
                            position: 'relative',
                            transition: 'height 0.1s ease'
                        }}
                    >
                        {/* Filled portion */}
                        <div style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            background: isDragging || hoverPct !== null ? '#1DB954' : '#b3b3b3',
                            borderRadius: '3px',
                            position: 'relative',
                            transition: 'background 0.1s, width 0.05s linear'
                        }}>
                            {/* Draggable thumb/cursor */}
                            <div style={{
                                position: 'absolute',
                                right: '-7px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                opacity: isDragging || hoverPct !== null ? 1 : 0,
                                transition: 'opacity 0.15s',
                                cursor: 'grab',
                                zIndex: 2
                            }} />
                        </div>

                        {/* Hover preview line */}
                        {hoverPct !== null && !isDragging && (
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, height: '100%',
                                width: `${hoverPct}%`,
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '3px',
                                pointerEvents: 'none'
                            }} />
                        )}
                    </div>

                    <span style={{ color: '#a7a7a7', fontSize: '11px', minWidth: '36px' }}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* RIGHT — Volume & Panel Toggle */}
            <div className="player-volume-control" style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '220px', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ color: '#b3b3b3', fontSize: '16px' }}>🔊</span>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        style={{ width: '80px', accentColor: '#1DB954', cursor: 'pointer' }}
                    />
                </div>

                <button
                    className="player-panel-toggle"
                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    title="Now Playing View"
                    style={{
                        background: isRightPanelOpen ? 'rgba(29,185,84,0.15)' : 'none',
                        border: '1px solid ' + (isRightPanelOpen ? 'rgba(29,185,84,0.4)' : 'transparent'),
                        borderRadius: '6px', padding: '6px 10px',
                        color: isRightPanelOpen ? '#1DB954' : '#b3b3b3',
                        cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s'
                    }}
                >
                    ▤
                </button>
            </div>
        </div>
    );
}
