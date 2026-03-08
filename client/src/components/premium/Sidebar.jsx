import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { MOCK_DATA } from '../../services/mockData';

export default function PremiumSidebar() {
    return (
        <div className="w-64 bg-zinc-950 flex flex-col h-screen shrink-0 border-r border-white/5 overflow-hidden">
            {/* Logo */}
            <div className="p-6 pb-4 flex items-center gap-2">
                <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-black">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm4.35 13.01c-.2.32-.61.41-.93.21-2.45-1.5-5.54-1.84-9.17-1.01-.36.08-.72-.14-.81-.5-.09-.36.14-.72.5-.81 3.96-.91 7.37-.52 10.12 1.17.32.2.42.61.22.94zm1.16-2.45c-.25.41-.78.53-1.18.28-2.8-1.72-7.07-2.22-10.38-1.22-.46.14-.95-.12-1.09-.58-.14-.46.12-.95.58-1.09 3.77-1.14 8.5-.59 11.77 1.42.41.25.54.78.3 1.19zm.11-2.58C14.07 5.92 8.08 5.72 4.6 6.78c-.54.16-1.11-.14-1.27-.68-.16-.54.14-1.11.68-1.27 4.02-1.22 10.64-.99 14.71 1.43.49.29.65.92.36 1.41-.29.49-.92.65-1.41.36h-.05z" />
                    </svg>
                </div>
                <span className="text-2xl font-black tracking-tight text-white italic">Groove</span>
            </div>

            {/* Main Nav */}
            <nav className="p-2 space-y-1">
                <NavItem to="/" icon={<Home size={24} />} label="Home" />
                <NavItem to="/search" icon={<Search size={24} />} label="Search" />
                <NavItem to="/library" icon={<Library size={24} />} label="Your Library" />
            </nav>

            <div className="mt-6 px-4">
                <div className="h-px bg-white/10 w-full mb-6" />

                <button className="flex items-center gap-4 py-2 text-zinc-400 hover:text-white transition-colors group px-2 w-full text-left">
                    <div className="bg-zinc-800 p-1 rounded-sm group-hover:bg-zinc-700 transition-colors">
                        <PlusSquare size={20} />
                    </div>
                    <span className="text-sm font-bold">Create Playlist</span>
                </button>

                <button className="flex items-center gap-4 py-2 text-zinc-400 hover:text-white transition-colors group px-2 w-full text-left">
                    <div className="bg-gradient-to-br from-indigo-700 to-indigo-200 p-1 rounded-sm">
                        <Heart size={20} className="text-white fill-white" />
                    </div>
                    <span className="text-sm font-bold">Liked Songs</span>
                </button>
            </div>

            {/* Scrollable Playlist List */}
            <div className="flex-1 overflow-y-auto mt-4 px-6 space-y-3 pb-32 custom-scrollbar">
                {MOCK_DATA.playlists.map(playlist => (
                    <div key={playlist} className="text-sm text-zinc-400 hover:text-white cursor-pointer truncate transition-colors font-medium">
                        {playlist}
                    </div>
                ))}
            </div>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200
        ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}
      `}
        >
            {icon}
            <span className="font-bold text-sm tracking-wide">{label}</span>
        </NavLink>
    );
}
