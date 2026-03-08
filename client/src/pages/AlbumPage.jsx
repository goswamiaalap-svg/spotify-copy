import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Clock } from 'lucide-react';
import api from '../api/axios';
import TopBar from '../components/layout/TopBar';
import SongRow from '../components/SongRow';
import usePlayerStore from '../store/playerStore';

export default function AlbumPage() {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/albums/${id}`);
                setAlbum(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col h-full">
            <TopBar />
            <div className="flex-1 flex items-center justify-center"><div className="spinner" /></div>
        </div>
    );

    if (!album) return (
        <div className="flex flex-col h-full">
            <TopBar />
            <div className="flex-1 flex items-center justify-center"><p className="text-[#A7A7A7]">Album not found.</p></div>
        </div>
    );

    const songs = album.songs || [];
    const isPlaying_ = currentSong && songs.some(s => s._id === currentSong._id) && isPlaying;

    const handlePlayAll = () => {
        if (!songs.length) return;
        if (isPlaying_) togglePlay();
        else playSong(songs[0], songs);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto animate-fadeIn">
                <TopBar />
                <div
                    className="flex items-end gap-8 px-[var(--content-padding)] pt-12 pb-6 min-h-[340px]"
                    style={{ background: 'linear-gradient(180deg, #1a3a5c 0%, #0a0a0a 100%)' }}
                >
                    <img
                        src={album.imageUrl || 'https://placehold.co/232x232/1c1c1e/ffffff?text=💿'}
                        alt={album.title}
                        className="w-56 h-56 rounded shadow-[0_8px_48px_rgba(0,0,0,0.5)] object-cover shrink-0"
                    />
                    <div className="flex-1 pb-2">
                        <p className="text-[14px] font-bold text-white uppercase mb-4">Album</p>
                        <h1 className="hero-title my-0 leading-tight">
                            {album.title}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-6 text-sm font-semibold">
                            <span className="text-white hover:underline cursor-pointer">{album.artist?.name || 'Unknown'}</span>
                            <span className="text-[#A7A7A7]">{' • '}{album.releaseDate ? new Date(album.releaseDate).getFullYear() : ''}</span>
                            <span className="text-[#A7A7A7]">{' • '}{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 px-[var(--content-padding)] py-6 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.5)]">
                    <button
                        className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                        onClick={handlePlayAll}
                        id="album-play-btn"
                    >
                        {isPlaying_ ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                    </button>
                </div>

                <div className="px-[var(--content-padding)] pb-8">
                    <div className="grid items-center gap-4 px-4 mb-2 text-[#A7A7A7] text-xs uppercase tracking-wider border-b border-[#282828] pb-2"
                        style={{ gridTemplateColumns: '32px 4fr 120px' }}>


                        <span>#</span>
                        <span>Title</span>
                        <span className="flex justify-end"><Clock size={14} /></span>
                    </div>
                    {songs.map((song, i) => (
                        <SongRow key={song._id} song={song} index={i} songs={songs} showAlbum={false} />
                    ))}
                </div>
            </div>
        </div>
    );
}
