import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

export default function SongRow({ song, index, queue = [] }) {
    const [hovered, setHovered] = useState(false);
    const { currentSong, isPlaying, togglePlay, playSong } = usePlayerStore();

    const songId = song.id || song._id;
    const currentSongId = currentSong?.id || currentSong?._id;
    const isActive = currentSongId === songId;

    // Simple like state manager (local for row instance)
    const [isLiked, setIsLiked] = useState(false);

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    return (
        <div
            className="song-row"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => playSong(song, queue)}
            style={{
                display: 'grid',
                gap: '12px', alignItems: 'center',
                padding: '8px 16px', borderRadius: '6px',
                background: isActive ? 'rgba(29,185,84,0.1)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: isActive ? '2px solid #1DB954' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s'
            }}
        >
            {/* Number / GREEN Play button / Equalizer */}
            <div className="song-row-num" style={{ width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isActive && isPlaying && !hovered ? (
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                width: '3px', borderRadius: '2px', background: '#1DB954',
                                animation: `eq${i} 0.6s ease infinite alternate`,
                                animationDelay: `${i * 0.15}s`
                            }} />
                        ))}
                    </div>
                ) : hovered ? (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            isActive ? togglePlay() : playSong(song, queue);
                        }}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#1DB954', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', color: '#000', fontWeight: 900,
                            boxShadow: '0 4px 16px rgba(29,185,84,0.5)',
                            transition: 'transform 0.1s, box-shadow 0.15s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.12)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(29,185,84,0.7)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,185,84,0.5)';
                        }}
                    >
                        {isActive && isPlaying ? '⏸' : '▶'}
                    </button>
                ) : (
                    <span style={{ color: isActive ? '#1DB954' : '#a7a7a7', fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal' }}>
                        {index + 1}
                    </span>
                )}
            </div>

            {/* Album Art */}
            <img className="song-row-art" src={song.albumArt} alt=""
                style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                onError={e => e.target.src = 'https://via.placeholder.com/40x40/1a1a1a/ffffff?text=🎵'} />

            {/* Title + Artist */}
            <div className="song-row-info" style={{ minWidth: 0 }}>
                <div style={{
                    color: isActive ? '#1DB954' : '#fff',
                    fontSize: '14px', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{song.title}</div>
                <div style={{ color: '#a7a7a7', fontSize: '12px' }}>{song.artist}</div>
            </div>

            {/* Album */}
            <div className="song-row-album" style={{
                color: '#a7a7a7', fontSize: '13px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{song.album || 'Single'}</div>

            {/* Duration */}
            <div className="song-row-time" style={{ color: '#a7a7a7', fontSize: '13px', textAlign: 'right' }}>
                {formatTime(song.duration)}
            </div>

            {/* Options (Heart + More) */}
            <div className="song-row-options" style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                    style={{ background: 'none', border: 'none', color: isLiked ? '#1DB954' : '#a7a7a7', cursor: 'pointer', fontSize: '16px' }}
                >
                    {isLiked ? '❤️' : '♡'}
                </button>
                <button
                    onClick={(e) => e.stopPropagation()}
                    style={{ background: 'none', border: 'none', color: '#a7a7a7', cursor: 'pointer', fontSize: '16px' }}
                >
                    ⋮
                </button>
            </div>
        </div>
    );
}
