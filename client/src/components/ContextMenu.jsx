import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, ListPlus, Heart, Disc, Mic2, Plus, Share2, Download, Ban, X } from 'lucide-react';
import useLibraryStore from '../store/libraryStore';
import useAuthStore from '../store/authStore';
import usePlaylistStore from '../store/playlistStore';
import useToastStore from '../store/toastStore';
import AddToPlaylistModal from './AddToPlaylistModal';
import { useNavigate } from 'react-router-dom';

export default function ContextMenu({
    x, y,
    song,
    onClose,
    onPlay,
    onQueue
}) {
    const menuRef = useRef(null);
    const { user, isLoggedIn, openLoginModal } = useAuthStore();
    const { userPlaylists } = usePlaylistStore();
    const { isLiked, toggleLike } = useLibraryStore();
    const { showToast } = useToastStore();
    const navigate = useNavigate();

    const [showPlaylists, setShowPlaylists] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Smart positioning calculation
    const [coords, setCoords] = useState({ left: x, top: y });

    useEffect(() => {
        if (!menuRef.current) return;
        const menuWidth = 220;
        const menuHeight = 320;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let finalX = x;
        let finalY = y;

        // Flip left if too close to right edge
        if (x + menuWidth > windowWidth - 16) {
            finalX = x - menuWidth;
        }
        // Flip up if too close to bottom edge
        if (y + menuHeight > windowHeight - 16) {
            finalY = y - menuHeight;
        }

        setCoords({ left: finalX, top: finalY });
    }, [x, y]);

    useEffect(() => {
        if (isLoggedIn()) {
            usePlaylistStore.getState().fetchUserPlaylists();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleScroll = () => onClose();
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', handleEsc);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('keydown', handleEsc);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    const liked = isLiked(song._id);

    const checkAuth = (action) => {
        if (!isLoggedIn()) {
            onClose();
            openLoginModal();
            return false;
        }
        return true;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/song/${song._id}`);
        showToast("Link copied to clipboard");
        onClose();
    };

    const handleLike = () => {
        if (!checkAuth()) return;
        toggleLike(song._id);
        if (!liked) showToast("Saved to Liked Songs");
        else showToast("Removed from Liked Songs");
        onClose();
    };

    const handleAddToPlaylist = (e, playlist) => {
        e.stopPropagation();
        if (!checkAuth()) return;
        usePlaylistStore.getState().addToPlaylist(playlist._id, song, playlist.name);
        onClose();
    };

    const menuContent = (
        <div
            ref={menuRef}
            className="fixed z-[10001] context-menu animate-fadeIn min-w-[220px] py-1.5"
            style={{
                left: coords.left,
                top: coords.top,
                visibility: coords.left === x && coords.top === y ? 'hidden' : 'visible'
            }}
        >
            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium" onClick={() => { onPlay(); onClose(); }}>
                <Play size={16} fill="white" /> Play now
            </button>
            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium border-b border-white/5" onClick={() => { onQueue(); onClose(); }}>
                <ListPlus size={16} /> Add to queue
            </button>

            <div
                className="relative"
                onMouseEnter={() => setShowPlaylists(true)}
                onMouseLeave={() => setShowPlaylists(false)}
            >
                <button
                    onClick={() => !isLoggedIn() && checkAuth()}
                    className="context-menu-item flex items-center justify-between w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium"
                >
                    <span className="flex items-center gap-3"><Plus size={16} /> Add to playlist</span>
                    <span className="text-xl leading-none -mt-1 opacity-50">›</span>
                </button>

                {showPlaylists && isLoggedIn() && (
                    <div className="absolute top-0 right-full mr-0.5 context-menu min-w-[200px] py-1.5 border border-white/5">
                        <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-semibold border-b border-white/5"
                            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
                            <Plus size={16} strokeWidth={3} /> Create new playlist
                        </button>
                        <div className="max-h-[220px] overflow-y-auto">
                            {userPlaylists.length > 0 ? (
                                userPlaylists.map(pl => (
                                    <button
                                        key={pl._id}
                                        className="context-menu-item w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left truncate"
                                        onClick={(e) => handleAddToPlaylist(e, pl)}
                                    >
                                        {pl.name}
                                    </button>
                                ))
                            ) : (
                                <p className="px-4 py-3 text-xs text-white/40 italic">No playlists yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium border-b border-white/5" onClick={handleLike}>
                <Heart size={16} fill={liked ? '#8b5cf6' : 'none'} stroke={liked ? '#8b5cf6' : 'currentColor'} /> {liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            </button>

            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium" onClick={() => { navigate(`/album/${song.album?._id || song.album}`); onClose(); }}>
                <Disc size={16} /> Go to album
            </button>
            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium border-b border-white/5" onClick={() => { navigate(`/artist/${song.artist?._id || song.artist}`); onClose(); }}>
                <Mic2 size={16} /> Go to artist
            </button>

            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/90 hover:text-white transition-colors text-left font-medium" onClick={handleCopy}>
                <Share2 size={16} /> Share song
            </button>
            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[14px] text-white/30 transition-colors text-left font-medium cursor-not-allowed">
                <Download size={16} /> Download
            </button>
            <button className="context-menu-item flex items-center gap-3 w-full px-4 h-10 text-[13px] text-red-400 hover:text-red-300 transition-colors text-left font-medium" onClick={() => { showToast("We'll recommend less of this."); onClose(); }}>
                <Ban size={16} /> Don't play this
            </button>
        </div>
    );
    return (
        <>
            {createPortal(menuContent, document.body)}
            {showModal && (
                <AddToPlaylistModal
                    song={song}
                    onClose={() => { setShowModal(false); onClose(); }}
                />
            )}
        </>
    );
}
