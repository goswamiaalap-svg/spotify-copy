import { X, Trash2, ListMusic } from 'lucide-react';
import usePlayerStore from '../store/playerStore';

export default function QueueDrawer({ onClose }) {
    const { queue, currentSong, queueSource, removeFromQueue, playSong, clearQueue } = usePlayerStore();

    const currentIdx = queue.findIndex(s => s._id === currentSong?._id);
    const upcoming = queue.slice(currentIdx + 1);
    const previous = currentIdx > 0 ? queue.slice(0, currentIdx) : [];

    return (
        <div className="fixed right-0 bottom-[var(--player-height)] top-0 w-80 bg-[#121212] border-l border-[#282828] flex flex-col z-40 animate-fadeIn shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#282828]">
                <div className="flex items-center gap-2">
                    <ListMusic size={18} className="text-[#fc3c44]" />
                    <div>
                        <h3 className="text-white font-bold text-base leading-none">Queue</h3>
                        {queueSource && (
                            <p className="text-[#A7A7A7] text-xs mt-0.5">{queueSource}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {queue.length > 0 && (
                        <button
                            onClick={clearQueue}
                            className="text-[#A7A7A7] hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-[#282828]"
                            title="Clear queue"
                        >
                            Clear
                        </button>
                    )}
                    <button onClick={onClose} className="text-[#A7A7A7] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Now playing */}
                {currentSong && (
                    <>
                        <p className="text-[#A7A7A7] text-xs font-bold uppercase tracking-wider mb-3">Now Playing</p>
                        <div className="flex items-center gap-3 mb-6 p-2 bg-[#1a1a1a] rounded-lg border border-[#fc3c44]/30">
                            <img
                                src={currentSong.imageUrl || 'https://placehold.co/48x48/1c1c1e/fff?text=♪'}
                                alt={currentSong.title}
                                className="w-10 h-10 rounded object-cover shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-[#fc3c44] text-sm font-semibold truncate">{currentSong.title}</p>
                                <p className="text-[#A7A7A7] text-xs truncate">
                                    {currentSong.artist?.name || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                    <>
                        <p className="text-[#A7A7A7] text-xs font-bold uppercase tracking-wider mb-3">
                            Next Up · {upcoming.length} song{upcoming.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-col gap-1 mb-6">
                            {upcoming.map((song, i) => (
                                <div
                                    key={`${song._id}-${i}`}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-[#282828] cursor-pointer group transition-colors"
                                    onClick={() => playSong(song, queue)}
                                >
                                    <img
                                        src={song.imageUrl || 'https://placehold.co/40x40/1c1c1e/fff?text=♪'}
                                        alt={song.title}
                                        className="w-9 h-9 rounded object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{song.title}</p>
                                        <p className="text-[#A7A7A7] text-xs truncate">
                                            {song.artist?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <button
                                        className="text-[#A7A7A7] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                        onClick={(e) => { e.stopPropagation(); removeFromQueue(song._id); }}
                                        aria-label="Remove from queue"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* History */}
                {previous.length > 0 && (
                    <>
                        <p className="text-[#A7A7A7] text-xs font-bold uppercase tracking-wider mb-3">
                            Previously in queue
                        </p>
                        <div className="flex flex-col gap-1">
                            {previous.map((song, i) => (
                                <div
                                    key={`${song._id}-prev-${i}`}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-[#282828] cursor-pointer group transition-colors opacity-50 hover:opacity-80"
                                    onClick={() => playSong(song, queue)}
                                >
                                    <img
                                        src={song.imageUrl || 'https://placehold.co/40x40/1c1c1e/fff?text=♪'}
                                        alt={song.title}
                                        className="w-9 h-9 rounded object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{song.title}</p>
                                        <p className="text-[#A7A7A7] text-xs truncate">
                                            {song.artist?.name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Empty queue */}
                {!currentSong && queue.length === 0 && (
                    <div className="text-center py-12">
                        <ListMusic size={40} className="text-[#535353] mx-auto mb-3" />
                        <p className="text-[#A7A7A7] text-sm">No songs in queue</p>
                        <p className="text-[#535353] text-xs mt-1">Play a song to start building your queue</p>
                    </div>
                )}
            </div>
        </div>
    );
}
