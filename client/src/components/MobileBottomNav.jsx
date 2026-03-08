import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔍', label: 'Search', path: '/search' },
    { icon: '📚', label: 'Library', path: '/liked-songs' },
];

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    if (!isMobile) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '56px', background: '#000000',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            zIndex: 10000, paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
            {tabs.map(tab => {
                const isActive = location.pathname === tab.path;
                return (
                    <button key={tab.path} onClick={() => navigate(tab.path)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '2px', background: 'none', border: 'none',
                            cursor: 'pointer', padding: '4px 20px',
                            opacity: isActive ? 1 : 0.6, transition: 'opacity 0.15s'
                        }}>
                        <span style={{ fontSize: '22px' }}>{tab.icon}</span>
                        <span style={{ color: isActive ? '#fff' : '#a7a7a7', fontSize: '10px', fontWeight: isActive ? 700 : 400 }}>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
