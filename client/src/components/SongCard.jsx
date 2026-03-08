import { Play, Pause } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import { useNavigate } from 'react-router-dom';

export default function SongCard({ song, songs = [], navigateTo }) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
    const navigate = useNavigate();
    const isCurrentSong = currentSong?._id === song._id;

    const handlePlay = (e) => {
        e.stopPropagation();
        if (isCurrentSong) togglePlay();
        else playSong(song, songs.length > 0 ? songs : [song]);
    };

    const handleClick = () => {
        if (navigateTo) navigate(navigateTo);
        else if (song.album) navigate(`/album/${song.album?._id || song.album}`);
    };

    return (
        <div
            className="card group relative flex-shrink-0 cursor-pointer"
            onClick={handleClick}
        >
            <div className="relative mb-5 overflow-hidden rounded-xl shadow-2xl">
                <img
                    src={song.imageUrl || 'https://placehold.co/176x176/1c1c1e/ffffff?text=♪'}
                    alt={song.title}
                    crossOrigin="anonymous"
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button
                    className={`card-play-btn shadow-[0_8px_24px_rgba(29,185,84,0.5)] ${isCurrentSong && isPlaying ? 'opacity-100 translate-y-0' : ''}`}
                    onClick={handlePlay}
                    aria-label="Play"
                >
                    {isCurrentSong && isPlaying
                        ? <Pause size={24} fill="black" />
                        : <Play size={24} fill="black" className="ml-1" />
                    }
                </button>
            </div>
            <div className="px-1 text-left">
                <p className={`text-[15px] font-black truncate mb-1 transition-colors ${isCurrentSong ? 'text-[#8b5cf6]' : 'text-white group-hover:text-[#8b5cf6]'}`}>
                    {song.title}
                </p>
                <p className="text-[#a7a7a7] text-[13px] font-bold truncate group-hover:text-white/60 transition-colors uppercase tracking-wider">
                    {song.artist?.name || song.artist || 'Unknown Artist'}
                </p>
            </div>
        </div>
    );
}

