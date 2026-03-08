import { useState } from 'react';
import { X } from 'lucide-react';
import usePlaylistStore from '../store/playlistStore';

export default function AddToPlaylistModal({ onClose, song }) {
    const { createNewPlaylist } = usePlaylistStore();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await createNewPlaylist(name.trim(), desc.trim(), isPublic, song);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99999] px-4 backdrop-blur-sm">
            <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-2xl font-bold">Create New Playlist</h2>
                    <button onClick={onClose} className="text-[#a7a7a7] hover:bg-[#3E3E3E] rounded-full p-2 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#3E3E3E] text-white rounded-md px-4 py-3 placeholder-[#A7A7A7] outline-none focus:ring-2 focus:ring-[#1DB954]"
                            required
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Add an optional description"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-[#3E3E3E] text-white rounded-md px-4 py-3 resize-none h-24 placeholder-[#A7A7A7] outline-none focus:ring-2 focus:ring-[#1DB954]"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 accent-[#1DB954]"
                            id="public-check"
                        />
                        <label htmlFor="public-check" className="text-white select-none whitespace-nowrap">Make public?</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="mt-4 bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create & Add'}
                    </button>
                </form>
            </div>
        </div>
    );
}
