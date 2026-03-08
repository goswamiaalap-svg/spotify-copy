import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import api from '../api/axios';
import TopBar from '../components/layout/TopBar';
import SongRow from '../components/SongRow';
import usePlayerStore from '../store/playerStore';
import useLibraryStore from '../store/libraryStore';
import useAuthStore from '../store/authStore';

export default function PlaylistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
    const { deletePlaylist } = useLibraryStore();
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const { data } = await api.get(`/playlists/${id}`);
                setPlaylist(data);
            } catch (e) {
                console.error('fetchPlaylist error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <TopBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="flex flex-col h-full">
                <TopBar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-[#A7A7A7]">Playlist not found.</p>
                </div>
            </div>
        );
    }

    const songs = playlist.songs || [];
    const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
    const formatTotal = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return h > 0 ? `${h} hr ${m} min` : `${m} min`;
    };

    const isPlaylistPlaying =
        currentSong && songs.some(s => s._id === currentSong._id) && isPlaying;

    const handlePlayAll = () => {
        if (songs.length === 0) return;
        if (isPlaylistPlaying) {
            togglePlay();
        } else {
            playSong(songs[0], songs);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this playlist?')) return;
        await deletePlaylist(id);
        navigate('/library');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto animate-fadeIn">
                <TopBar />
                {/* Header */}
                <div
                    className="flex items-end gap-8 px-[var(--content-padding)] pt-12 pb-6 min-h-[340px]"
                    style={{ background: 'linear-gradient(180deg, #3d3d3d 0%, #0a0a0a 100%)' }}
                >
                    <img
                        src={playlist.imageUrl || 'https://placehold.co/232x232/1c1c1e/ffffff?text=♫'}
                        alt={playlist.name}
                        className="w-56 h-56 rounded shadow-[0_8px_48px_rgba(0,0,0,0.5)] object-cover shrink-0"
                    />
                    <div className="flex-1 pb-2">
                        <p className="text-[14px] font-bold text-white uppercase mb-4">Playlist</p>
                        <h1 className="hero-title my-0 leading-tight">
                            {playlist.name}
                        </h1>
                        {playlist.description && (
                            <p className="description-text mt-4 mb-0">{playlist.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-6 text-sm font-semibold">
                            <span className="text-white hover:underline cursor-pointer">{playlist.owner?.name || 'You'}</span>
                            <span className="text-[#A7A7A7]">{' • '}{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
                            <span className="text-[#A7A7A7]">{' • '}{formatTotal(totalDuration)}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 px-[var(--content-padding)] py-6 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.5)]">
                    <button
                        className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                        onClick={handlePlayAll}
                        id="playlist-play-btn"
                    >
                        {isPlaylistPlaying
                            ? <Pause size={24} fill="black" />
                            : <Play size={24} fill="black" className="ml-1" />
                        }
                    </button>
                    {user && (playlist.owner?._id === user._id || playlist.owner === user._id) && (
                        <button
                            onClick={handleDelete}
                            className="text-[#A7A7A7] hover:text-white transition-colors"
                            title="Delete playlist"
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                </div>

                {/* Song table */}
                <div className="px-[var(--content-padding)] pb-8">
                    {/* Header row */}
                    <div className="grid items-center gap-4 px-4 mb-2 text-[#A7A7A7] text-xs uppercase tracking-wider border-b border-[#282828] pb-2"
                        style={{ gridTemplateColumns: '32px 4fr 2fr 120px' }}>
                        <span>#</span>
                        <span>Title</span>
                        <span className="hidden md:block">Album</span>
                        <span className="flex justify-end"><Clock size={14} /></span>
                    </div>

                    {songs.length > 0 ? (
                        songs.map((song, i) => (
                            <SongRow key={song._id} song={song} index={i} songs={songs} />
                        ))
                    ) : (
                        <p className="text-[#A7A7A7] text-center py-12">This playlist is empty. Add songs from Search.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
