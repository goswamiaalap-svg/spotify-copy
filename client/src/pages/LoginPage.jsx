import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async () => {
        if (!email || !password) { setError('Please fill all fields'); return; }
        setLoading(true); setError('');

        try {
            if (isLogin) {
                // Simple demo logic - any 4+ char password works
                if (password.length >= 4) {
                    login({ name: email.split('@')[0], email }, 'demo-token-' + Date.now());
                    navigate('/');
                } else {
                    setError('Password must be at least 4 characters');
                }
            } else {
                if (!name) { setError('Enter your name'); setLoading(false); return; }
                const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
                if (users.find(u => u.email === email)) {
                    setError('Account exists. Please log in.'); setLoading(false); return;
                }
                users.push({ name, email, password });
                localStorage.setItem('registered_users', JSON.stringify(users));
                login({ name, email }, 'demo-token-' + Date.now());
                navigate('/');
            }
        } catch { setError('Something went wrong'); }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', height: '50px', padding: '0 16px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', color: '#fff', fontSize: '15px',
        outline: 'none', caretColor: '#1DB954',
        boxSizing: 'border-box', transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0a0a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            backgroundImage: 'radial-gradient(ellipse at 25% 35%,rgba(29,185,84,0.07) 0%,transparent 55%),radial-gradient(ellipse at 75% 65%,rgba(139,92,246,0.05) 0%,transparent 50%)',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Grid bg */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.025,
                backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '40px 40px', pointerEvents: 'none'
            }} />

            <div style={{
                width: '420px', padding: '48px 40px',
                background: 'rgba(18,18,18,0.96)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.85),0 0 80px rgba(29,185,84,0.04)',
                position: 'relative', zIndex: 1
            }}>
                {/* Top glow */}
                <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                    background: 'linear-gradient(90deg,transparent,rgba(29,185,84,0.7),transparent)'
                }} />

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '68px', height: '68px', borderRadius: '50%',
                        background: '#1DB954', margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '30px', boxShadow: '0 0 40px rgba(29,185,84,0.4)'
                    }}>🎵</div>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{ color: '#a7a7a7', fontSize: '14px' }}>
                        {isLogin ? 'Log in to continue listening' : 'Join millions of music lovers'}
                    </p>
                </div>

                {/* Toggle */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.06)',
                    borderRadius: '10px', padding: '4px', marginBottom: '28px',
                    border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    {['Log in', 'Sign up'].map((t, i) => (
                        <button key={t} onClick={() => { setIsLogin(i === 0); setError(''); }} style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: (isLogin ? i === 0 : i === 1) ? '#fff' : 'transparent',
                            color: (isLogin ? i === 0 : i === 1) ? '#000' : '#a7a7a7',
                            fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                        }}>{t}</button>
                    ))}
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {!isLogin && (
                        <input value={name} onChange={e => setName(e.target.value)}
                            placeholder="Your name" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(29,185,84,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    )}
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Email address" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(29,185,84,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Password" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(29,185,84,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
                        color: '#f87171', fontSize: '13px', marginBottom: '16px'
                    }}>⚠️ {error}</div>
                )}

                <button onClick={handleSubmit} disabled={loading} style={{
                    width: '100%', height: '52px', background: loading ? '#158a3e' : '#1DB954',
                    border: 'none', borderRadius: '500px', color: '#000',
                    fontSize: '16px', fontWeight: 800, cursor: loading ? 'default' : 'pointer',
                    boxShadow: '0 4px 20px rgba(29,185,84,0.4)', transition: 'all 0.2s',
                    letterSpacing: '0.3px'
                }}
                    onMouseEnter={e => { if (!loading) e.target.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#6a6a6a', fontSize: '12px' }}>
                    Demo: any email + 4+ char password works
                </p>
            </div>
        </div>
    );
}
