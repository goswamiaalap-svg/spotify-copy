import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist }) {
    const navigate = useNavigate();

    return (
        <div
            className="card group relative flex-shrink-0 cursor-pointer text-center"
            onClick={() => navigate(`/artist/${artist._id}`)}
        >
            <div className="relative mb-5 px-2">
                <div className="relative aspect-square overflow-hidden rounded-full shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <img
                        src={artist.imageUrl || 'https://placehold.co/176x176/282828/ffffff?text=🎤'}
                        alt={artist.name}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            </div>
            <p className="text-white text-[16px] font-black truncate group-hover:text-[#8b5cf6] transition-colors">{artist.name}</p>
            <p className="text-[#6a6a6a] text-[12px] font-black uppercase tracking-[2px] mt-1 truncate">Artist</p>
        </div>
    );
}

