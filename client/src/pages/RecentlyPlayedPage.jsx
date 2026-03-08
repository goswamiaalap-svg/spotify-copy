import { usePlayerStore } from '../store/playerStore';

export default function RecentlyPlayedPage() {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const { playSong } = usePlayerStore();

    const fmt = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    const SongRow = ({ song, index }) => (
        <div
            key={`${song.id}-${index}`}
            onClick={() => playSong(song, recent)}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            style={{
                display: 'grid',
                gridTemplateColumns: '32px 48px 1fr 1fr 60px',
                gap: '12px', alignItems: 'center',
                padding: '8px 16px', borderRadius: '6px',
                cursor: 'pointer', transition: 'background 0.15s'
            }}
        >
            <span style={{ color: '#a7a7a7', fontSize: '14px', textAlign: 'center' }}>{index + 1}</span>
            <img src={song.albumArt} alt=""
                style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
            <div style={{ minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                <div style={{ color: '#a7a7a7', fontSize: '13px' }}>{song.artist}</div>
            </div>
            <div style={{ color: '#a7a7a7', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.album}</div>
            <div style={{ color: '#a7a7a7', fontSize: '13px', textAlign: 'right' }}>{fmt(song.duration)}</div>
        </div>
    );

    return (
        <div style={{ padding: '32px', background: '#121212', minHeight: '100%' }}>
            <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>Recently Played</h1>
            {recent.length === 0
                ? <div style={{ textAlign: 'center', padding: '60px', color: '#a7a7a7' }}>
                    <div style={{ fontSize: '48px' }}>🕐</div>
                    <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginTop: '16px' }}>No listening history yet</p>
                    <p style={{ marginTop: '8px' }}>Start playing songs to see them here</p>
                </div>
                : recent.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} />)
            }
        </div>
    );
}
