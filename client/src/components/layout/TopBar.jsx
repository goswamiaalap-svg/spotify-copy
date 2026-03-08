import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useState, useRef, useEffect } from 'react';

export default function TopBar({ bgcolor }) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const bgStyle = bgcolor
        ? { background: `linear-gradient(${bgcolor}cc 0%, transparent 100%)` }
        : { background: 'rgba(0,0,0,0.4)' };

    return (
        <header
            className="flex items-center justify-between px-6 py-4 sticky top-0 z-20"
            style={bgStyle}
        >
            {/* Back / Forward */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => navigate(1)}
                    className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    aria-label="Go forward"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Auth area */}
            <div className="flex items-center gap-3">
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="flex items-center gap-2 bg-black/50 hover:bg-black/70 rounded-full px-2 py-1 transition-colors"
                            id="user-menu-btn"
                        >
                            <div className="w-7 h-7 rounded-full bg-[#535353] flex items-center justify-center text-white text-xs font-bold">
                                {user.name?.[0]?.toUpperCase() || <User size={14} />}
                            </div>
                            <span className="text-sm font-semibold text-white pr-1">{user.name}</span>
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded-md shadow-2xl py-1 z-50">
                                <div className="px-4 py-2 text-xs text-[#A7A7A7] border-b border-[#3E3E3E]">
                                    {user.email}
                                </div>
                                <button
                                    onClick={() => { logout(); setMenuOpen(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#3E3E3E] transition-colors"
                                    id="logout-btn"
                                >
                                    <LogOut size={16} />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="desktop-auth" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginLeft: 'auto'
                    }}>
                        <button style={{
                            background: 'none', border: 'none',
                            color: '#b3b3b3', fontWeight: '700',
                            fontSize: '14px', cursor: 'pointer',
                            padding: '8px 16px', borderRadius: '500px',
                            transition: 'color 0.2s'
                        }}
                            onMouseEnter={e => e.target.style.color = '#ffffff'}
                            onMouseLeave={e => e.target.style.color = '#b3b3b3'}
                            onClick={() => navigate('/register')}
                        >
                            Sign up
                        </button>
                        <button style={{
                            background: '#ffffff', border: 'none',
                            color: '#000000', fontWeight: '700',
                            fontSize: '14px', cursor: 'pointer',
                            padding: '12px 32px', borderRadius: '500px',
                            transition: 'transform 0.1s'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            onClick={() => navigate('/login')}
                        >
                            Log in
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
