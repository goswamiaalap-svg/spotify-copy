import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlbumCard({ album }) {
    const navigate = useNavigate();

    return (
        <div
            className="card group relative flex-shrink-0 cursor-pointer"
            onClick={() => navigate(`/album/${album._id}`)}
        >
            <div className="relative mb-5 overflow-hidden rounded-xl shadow-2xl">
                <img
                    src={album.imageUrl || 'https://placehold.co/176x176/1c1c1e/ffffff?text=💿'}
                    alt={album.title}
                    crossOrigin="anonymous"
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                />
                <button
                    className="card-play-btn shadow-[0_8px_24px_rgba(29,185,84,0.5)]"
                    onClick={(e) => { e.stopPropagation(); /* TODO: Play Album */ }}
                >
                    <Play size={24} fill="black" />
                </button>
            </div>
            <div className="px-1 text-left">
                <p className="text-white text-[15px] font-black truncate mb-1 group-hover:text-[#8b5cf6] transition-colors">{album.title}</p>
                <p className="text-[#a7a7a7] text-[13px] font-bold truncate group-hover:text-white/60 transition-colors uppercase tracking-wider">
                    {album.artist?.name || album.artist || 'Unknown Artist'}
                </p>
            </div>
        </div>
    );
}

