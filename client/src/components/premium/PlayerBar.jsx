import React from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
    Volume2, VolumeX, ListMusic, Maximize2
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export default function PremiumPlayerBar() {
    const { currentSong, isPlaying, togglePlay, playNext, playPrev, progress, duration, seekTo, volume, setVolume } = usePlayerStore();

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#000000] border-t border-white/5 flex items-center px-4 z-[100] select-none shadow-2xl">
            {/* 🟢 LEFT: SONG INFO */}
            <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
                {currentSong ? (
                    <>
                        <div className="w-14 h-14 bg-zinc-800 rounded-md overflow-hidden shadow-lg group relative cursor-pointer">
                            <img src={currentSong.albumArt} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 size={16} className="text-white" />
                            </div>
                        </div>
                        <div className="min-w-0 pr-4">
                            <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer tracking-tight">
                                {currentSong.title}
                            </h4>
                            <p className="text-[11px] font-medium text-spotify-text-dim hover:text-white hover:underline cursor-pointer transition-colors mt-0.5 truncate uppercase tracking-wider">
                                {currentSong.artist}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-zinc-500 text-xs italic">No song playing</div>
                )}
            </div>

            {/* 🟢 CENTER: CONTROLS & PROGRESS */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px]">
                <div className="flex items-center gap-6">
                    <ControlButton icon={<Shuffle size={16} />} />
                    <ControlButton onClick={playPrev} icon={<SkipBack size={20} fill="currentColor" />} />
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
                    >
                        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <ControlButton onClick={playNext} icon={<SkipForward size={20} fill="currentColor" />} />
                    <ControlButton icon={<Repeat size={16} />} />
                </div>

                <div className="w-full flex items-center gap-2 group">
                    <span className="text-[11px] font-medium text-spotify-text-dim min-w-[40px] text-right">
                        {formatTime(progress)}
                    </span>
                    <div className="relative flex-1 h-3 flex items-center cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        seekTo(pct * duration);
                    }}>
                        <div className="absolute w-full h-1 bg-zinc-700 rounded-full group-hover:bg-zinc-600 transition-colors" />
                        <div
                            className="absolute h-1 bg-white rounded-full group-hover:bg-spotify-green transition-colors"
                            style={{ width: `${progressPct}%` }}
                        />
                        <div
                            className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl"
                            style={{ left: `calc(${progressPct}% - 6px)` }}
                        />
                    </div>
                    <span className="text-[11px] font-medium text-spotify-text-dim min-w-[40px]">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* 🟢 RIGHT: VOLUME & EXTRAS */}
            <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
                <ControlButton icon={<ListMusic size={18} />} />
                <div className="flex items-center gap-2 w-32 group">
                    <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)}>
                        {volume > 0 ? <Volume2 size={18} className="text-zinc-400 group-hover:text-white transition-colors" /> : <VolumeX size={18} className="text-zinc-400" />}
                    </button>
                    <div className="relative flex-1 h-3 flex items-center cursor-pointer">
                        <input
                            type="range" min="0" max="1" step="0.01" value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute w-full h-1 bg-zinc-700 rounded-full group-hover:bg-zinc-600 transition-colors" />
                        <div
                            className="absolute h-1 bg-white rounded-full group-hover:bg-spotify-green transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        />
                        <div
                            className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl"
                            style={{ left: `calc(${volume * 100}% - 6px)` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ControlButton({ icon, onClick, active = false }) {
    return (
        <button
            onClick={onClick}
            className={`text-zinc-400 hover:text-white transition-all transform active:scale-90 ${active ? 'text-spotify-green' : ''}`}
        >
            {icon}
        </button>
    );
}
