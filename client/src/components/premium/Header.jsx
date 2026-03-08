import React from 'react';
import { ChevronLeft, ChevronRight, Search, User, LogOut, Settings, CreditCard } from 'lucide-react';

export default function PremiumHeader() {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[#121212]/95 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-800">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-800 opacity-50 cursor-not-allowed">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="relative group ml-4 w-80">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="What do you want to listen to?"
                        className="w-full h-11 bg-[#242424] border-none rounded-full px-10 text-sm font-medium focus:ring-2 focus:ring-white transition-all text-white placeholder:text-zinc-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-5">
                <button className="text-sm font-bold bg-white text-black px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] transition-transform active:scale-95 px-6 rounded-full tracking-wider uppercase text-[12px]">
                    Upgrade
                </button>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-1 bg-black rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300">
                            <User size={18} />
                        </div>
                        <span className="text-xs font-bold text-white mr-2">Aalap G.</span>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded shadow-2xl p-1 z-50 border border-white/5 animate-in fade-in zoom-in duration-75">
                            <DropdownItem icon={<Settings size={14} />} label="Account" />
                            <DropdownItem icon={<CreditCard size={14} />} label="Premium Plan" />
                            <div className="h-px bg-white/5 my-1" />
                            <DropdownItem icon={<LogOut size={14} />} label="Log out" />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function DropdownItem({ icon, label }) {
    return (
        <button className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors text-left">
            <span>{label}</span>
            {icon}
        </button>
    );
}
