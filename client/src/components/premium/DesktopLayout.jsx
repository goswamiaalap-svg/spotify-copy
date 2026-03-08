import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PlayerBar from './PlayerBar';
import { PremiumAlbumRow } from './MusicCard';
import { MOCK_DATA } from '../../services/mockData';

export default function PremiumDesktopLayout() {
    return (
        <div className="flex h-screen bg-spotify-black overflow-hidden font-circular">
            {/* 1. LEFT SIDEBAR */}
            <Sidebar />

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Header />

                <main className="flex-1 overflow-y-auto scroll-smooth pb-40 px-4">
                    <div className="max-w-[1920px] mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-700">

                        {/* Dynamic Sections */}
                        <PremiumAlbumRow title="Recently Played" songs={MOCK_DATA.recentlyPlayed} />
                        <PremiumAlbumRow title="Made For You" songs={MOCK_DATA.madeForYou} />

                        {/* Banner / Category Area (Optional extra premium feel) */}
                        <div className="mx-8 mt-12 mb-4 p-8 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-900 border border-white/5 shadow-2xl overflow-hidden relative group">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">Exclusive Release</div>
                                </div>
                                <h1 className="text-5xl font-black text-white leading-tight tracking-tight">After Hours<br />(Deluxe Edition)</h1>
                                <p className="text-zinc-300 font-bold max-w-md">Listen to the latest masterpiece from The Weeknd, now available in ultra-high fidelity audio.</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <button className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 active:scale-95 transition tracking-widest uppercase text-xs">Play Now</button>
                                    <button className="bg-black/40 text-white px-8 py-3 rounded-full font-black border border-white/20 hover:bg-black/60 transition tracking-widest uppercase text-xs">Save</button>
                                </div>
                            </div>
                            {/* Background Artwork */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none">
                                <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&h=1000&fit=crop" className="w-full h-full object-cover grayscale brightness-200" alt="" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 to-transparent pointer-events-none" />
                        </div>

                        <PremiumAlbumRow title="Trending Albums" songs={MOCK_DATA.trending} />

                        {/* Popular Artists Section */}
                        <section className="px-8 mt-12 mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-white tracking-tight hover:underline cursor-pointer">Popular Artists</h2>
                                <button className="text-[11px] font-black text-spotify-text-dim hover:text-white uppercase tracking-widest">Show All</button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                                {MOCK_DATA.artists.map(artist => (
                                    <div key={artist.id} className="p-4 bg-spotify-card rounded-xl hover:bg-spotify-hover transition-all duration-300 group cursor-pointer text-center border border-white/5">
                                        <div className="aspect-square w-full rounded-full overflow-hidden mb-4 shadow-xl group-hover:scale-105 transition-transform duration-500 ring-1 ring-white/10">
                                            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="text-[15px] font-bold text-white mb-1 truncate">{artist.name}</h3>
                                        <p className="text-[12px] font-medium text-spotify-text-dim">Artist</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* 3. BOTTOM PLAYER */}
            <PlayerBar />

            {/* 4. OVERLAYS / GLOBAL NOTIFICATIONS (Optional placeholder) */}
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-3 rounded-full shadow-2xl text-white font-bold text-sm pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                Ultra Stereo Audio Active
            </div>
        </div>
    );
}
