import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import PlaylistCard from '../components/PlaylistCard';
import AlbumCard from '../components/AlbumCard';
import SongRow from '../components/SongRow';
import useLibraryStore from '../store/libraryStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import PlaylistModal from '../components/PlaylistModal';

const TABS = ['Playlists', 'Albums', 'Liked Songs'];

export default function Library() {
    const [activeTab, setActiveTab] = useState('Playlists');
    const [albums, setAlbums] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { playlists, likedSongs, fetchAll, createPlaylist } = useLibraryStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchAll();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col h-full">
                <TopBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-white text-2xl font-bold">Enjoy your Library</h2>
                    <p className="text-[#A7A7A7]">Log in to see your saved playlists, albums, and liked songs.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                    >
                        Log in
                    </button>
                </div>
            </div>
        );
    }

    const handleCreate = async (name, desc) => {
        const pl = await createPlaylist(name, desc);
        if (pl) {
            setShowModal(false);
            navigate(`/playlist/${pl._id}`);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto animate-fadeIn">
                    <TopBar />
                    <div className="px-6 pb-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-white text-3xl font-bold">Your Library</h1>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 text-[#A7A7A7] hover:text-white transition-colors"
                            >
                                <PlusCircle size={28} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-8">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === tab
                                        ? 'bg-white text-black'
                                        : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                                        }`}
                                    id={`tab-${tab.toLowerCase().replace(/\s/g, '-')}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        {activeTab === 'Playlists' && (
                            playlists.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {playlists.map(pl => <PlaylistCard key={pl._id} playlist={pl} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-white font-bold text-xl mb-2">Create your first playlist</p>
                                    <p className="text-[#A7A7A7] mb-6">It's easy, we'll help you</p>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                                    >
                                        Create playlist
                                    </button>
                                </div>
                            )
                        )}

                        {activeTab === 'Albums' && (
                            <p className="text-[#A7A7A7]">Your saved albums will appear here.</p>
                        )}

                        {activeTab === 'Liked Songs' && (
                            likedSongs.length > 0 ? (
                                <div className="flex flex-col">
                                    {likedSongs.map((song, i) => (
                                        <SongRow key={song._id} song={song} index={i} songs={likedSongs} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-white font-bold text-xl">Songs you like will appear here</p>
                                    <p className="text-[#A7A7A7] mt-2">Save songs by tapping the heart icon</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <PlaylistModal onClose={() => setShowModal(false)} onSave={handleCreate} />
            )}
        </>
    );
}
