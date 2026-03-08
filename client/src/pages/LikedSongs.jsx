import { useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import SongRow from '../components/SongRow';
import { Heart } from 'lucide-react';
import useLibraryStore from '../store/libraryStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function LikedSongs() {
    const { likedSongs, fetchLikedSongs } = useLibraryStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchLikedSongs();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col h-full">
                <TopBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-white text-xl font-bold">Log in to see your liked songs</p>
                    <button onClick={() => navigate('/login')} className="bg-white text-black font-bold px-8 py-3 rounded-full">Log in</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto animate-fadeIn">
                <TopBar />
                <div
                    className="flex items-end gap-6 content-area pb-6"
                    style={{ background: 'linear-gradient(#4a3f9f 0%, #1a1a1a 80%)' }}
                >
                    <div className="w-48 h-48 rounded-md bg-gradient-to-br from-indigo-500 to-blue-300 flex items-center justify-center shadow-2xl shrink-0">
                        <Heart size={64} fill="white" className="text-white" />
                    </div>
                    <div className="pb-2">
                        <p className="text-xs font-bold text-white uppercase mb-2">Playlist</p>
                        <h1 className="text-white font-black mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
                            Liked Songs
                        </h1>
                        <p className="text-[#A7A7A7] text-sm">
                            <span className="text-white font-semibold">{user.name}</span>
                            {' • '}{likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="content-area pt-4 pb-8">
                    {likedSongs.length > 0 ? (
                        likedSongs.map((song, i) => (
                            <SongRow key={song._id} song={song} index={i} songs={likedSongs} />
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-white font-bold text-xl">Songs you like will appear here</p>
                            <p className="text-[#A7A7A7] mt-2">Save songs by tapping the heart icon next to any song.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
