import { useState } from 'react';
import { X } from 'lucide-react';

export default function PlaylistModal({ onClose, onSave, initial }) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await onSave(name.trim(), description.trim());
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[#282828] rounded-xl p-8 w-full max-w-md shadow-2xl animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-bold">
                        {initial ? 'Edit playlist details' : 'Create playlist'}
                    </h2>
                    <button onClick={onClose} className="text-[#A7A7A7] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-semibold text-white mb-2 block">Name</label>
                        <input
                            className="auth-input"
                            placeholder="My Playlist #1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            id="playlist-name-input"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-white mb-2 block">Description</label>
                        <textarea
                            className="auth-input resize-none"
                            placeholder="Add an optional description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={300}
                            id="playlist-desc-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="mt-2 bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        id="playlist-save-btn"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}
