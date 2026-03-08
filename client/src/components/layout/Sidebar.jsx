import { NavLink } from 'react-router-dom';

const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔍', label: 'Browse', path: '/search' },
    { icon: '📻', label: 'Radio', path: '/radio' },
];

const libraryItems = [
    { icon: '🕐', label: 'Recently Added', path: '/recently-added' },
    { icon: '❤️', label: 'Loved Songs', path: '/liked-songs' },
    { icon: '💿', label: 'Albums', path: '/albums' },
    { icon: '🎤', label: 'Artists', path: '/artists' },
    { icon: '📋', label: 'Playlists', path: '/playlists' },
    { icon: '🔄', label: 'Recently Played', path: '/recently-played' },
    { icon: '⬇️', label: 'Downloaded', path: '/downloaded' },
];

export default function Sidebar() {
    return (
        <div style={{
            width: '240px',
            minWidth: '240px',
            height: '100vh',
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 0 100px 0',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '28px' }}>🎵</span>
                <span style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#ffffff',
                    letterSpacing: '-0.5px'
                }}>Spotify</span>
            </div>

            {/* Main Nav */}
            <div style={{ padding: '8px 0' }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '10px 20px',
                            textDecoration: 'none',
                            color: isActive ? '#ffffff' : '#b3b3b3',
                            fontWeight: isActive ? '700' : '500',
                            fontSize: '14px',
                            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            borderLeft: isActive ? '3px solid #1DB954' : '3px solid transparent',
                            transition: 'all 0.15s ease',
                            cursor: 'pointer'
                        })}
                        onMouseEnter={e => {
                            if (!e.currentTarget.style.borderLeft.includes('1DB954')) {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!e.currentTarget.style.borderLeft.includes('1DB954')) {
                                e.currentTarget.style.color = '#b3b3b3';
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <span style={{ fontSize: '18px', minWidth: '20px', textAlign: 'center' }}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Library Section */}
            <div style={{ marginTop: '16px' }}>
                <div style={{
                    padding: '8px 20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#6a6a6a',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase'
                }}>
                    Library
                </div>
                {libraryItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '10px 20px',
                            textDecoration: 'none',
                            color: isActive ? '#ffffff' : '#b3b3b3',
                            fontWeight: isActive ? '700' : '400',
                            fontSize: '14px',
                            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            borderLeft: isActive ? '3px solid #1DB954' : '3px solid transparent',
                            transition: 'all 0.15s ease',
                            cursor: 'pointer'
                        })}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = '#b3b3b3';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Playlists Section */}
            <div style={{ marginTop: '16px' }}>
                <div style={{
                    padding: '8px 20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#6a6a6a',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase'
                }}>
                    Playlists
                </div>
                <NavLink
                    to="/create-playlist"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '10px 20px',
                        textDecoration: 'none',
                        color: '#b3b3b3',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                >
                    <span style={{
                        width: '20px', height: '20px',
                        background: '#b3b3b3', borderRadius: '2px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#000',
                        fontSize: '16px', fontWeight: '700',
                        minWidth: '20px'
                    }}>+</span>
                    <span>New Playlist</span>
                </NavLink>
            </div>
        </div>
    );
}
