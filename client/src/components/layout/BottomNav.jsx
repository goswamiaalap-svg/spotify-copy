import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { icon: <Home size={24} />, label: 'Home', path: '/' },
        { icon: <Search size={24} />, label: 'Search', path: '/search' },
        { icon: <Library size={24} />, label: 'Library', path: '/library' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/95 backdrop-blur-lg border-t border-white/5 flex justify-around items-center z-[1000] pb-[env(safe-area-inset-bottom)]">
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `
                        flex flex-col items-center gap-1 transition-colors
                        ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}
                    `}
                >
                    {item.icon}
                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
