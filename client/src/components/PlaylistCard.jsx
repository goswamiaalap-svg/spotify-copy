import { Play, Pause } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import { useNavigate } from 'react-router-dom';

export default function PlaylistCard({ playlist }) {
    const navigate = useNavigate();
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

    return (
        <div
            className="card relative w-44 flex-shrink-0 cursor-pointer"
            onClick={() => navigate(`/playlist/${playlist._id}`)}
        >
            <div className="relative mb-4">
                <img
                    src={playlist.imageUrl || 'https://placehold.co/176x176/282828/ffffff?text=♫'}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-md"
                />
                <button
                    className="card-play-btn"
                    onClick={(e) => { e.stopPropagation(); }}
                    aria-label="Play playlist"
                >
                    <Play size={20} fill="black" />
                </button>
            </div>
            <p className="text-white text-sm font-semibold truncate">{playlist.name}</p>
            <p className="text-[#A7A7A7] text-xs truncate mt-1">{playlist.description || 'Playlist'}</p>
        </div>
    );
}
