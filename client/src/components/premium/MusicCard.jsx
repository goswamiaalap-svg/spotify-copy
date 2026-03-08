import React from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export default function PremiumMusicCard({ song, queue = [] }) {
    const { playSong } = usePlayerStore();

    return (
        <div
            onClick={() => playSong(song, queue)}
            className="group relative flex flex-col p-4 bg-spotify-card rounded-xl hover:bg-spotify-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-2xl"
        >
            <div className="relative aspect-square w-full mb-4 shadow-lg overflow-hidden rounded-lg">
                <img
                    src={song.albumArt || 'https://via.placeholder.com/300?text=Music'}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-zinc-800"
                />

                <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95">
                    <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-2xl transform transition hover:brightness-110">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            </div>

            <div className="min-h-[46px]">
                <h3 className="text-[15px] font-bold text-white truncate mb-1">
                    {song.title}
                </h3>
                <p className="text-[13px] font-medium text-spotify-text-dim line-clamp-2">
                    {song.artist}
                </p>
            </div>
        </div>
    );
}

export function PremiumAlbumRow({ title, songs }) {
    return (
        <section className="px-8 mt-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight hover:underline cursor-pointer">{title}</h2>
                <button className="text-[11px] font-black text-spotify-text-dim hover:text-white uppercase tracking-widest transition-colors">Show All</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                {songs.slice(0, 14).map(song => (
                    <PremiumMusicCard key={song.id} song={song} queue={songs} />
                ))}
            </div>
        </section>
    );
}
