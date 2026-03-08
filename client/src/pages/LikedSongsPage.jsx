import { usePlayerStore } from '../store/playerStore';

export default function LikedSongsPage() {
    const liked = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const { playSong } = usePlayerStore();

    const fmt = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--';

    const SongRow = ({ song, index }) => (
        <div
            key={song.id}
            onClick={() => playSong(song, liked)}
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
        <div style={{ padding: '32px', background: 'linear-gradient(180deg,#4a1a6e 0%,#121212 300px)', minHeight: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg,#450af5,#c4efd9)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>❤️</div>
                <div>
                    <div style={{ color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Playlist</div>
                    <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 900, letterSpacing: '-1px' }}>Liked Songs</h1>
                    <div style={{ color: '#a7a7a7', fontSize: '14px', marginTop: '8px' }}>{liked.length} songs</div>
                </div>
            </div>
            {liked.length === 0
                ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#a7a7a7' }}>
                    <div style={{ fontSize: '48px' }}>❤️</div>
                    <p style={{ fontSize: '20px', color: '#fff', fontWeight: 700, marginTop: '16px' }}>Songs you like will appear here</p>
                    <p style={{ marginTop: '8px' }}>Save songs by pressing the heart icon</p>
                </div>
                : liked.map((s, i) => <SongRow key={s.id} song={s} index={i} />)
            }
        </div>
    );
}
