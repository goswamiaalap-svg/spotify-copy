import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        const res = await login(email, password);
        if (res.success) navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-card animate-fadeIn">
                {/* Futuristic Logo */}
                <div className="logo-container">
                    <div className="logo-ring" />
                    <div className="logo-ring logo-ring-2" />
                    <svg className="logo-icon" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="28"
                            fill="none"
                            stroke="url(#logoGrad)"
                            strokeWidth="1.5"
                        />
                        <rect x="16" y="22" width="5" height="16" rx="2.5" fill="url(#logoGrad)" />
                        <rect x="24" y="16" width="5" height="28" rx="2.5" fill="url(#logoGrad)" />
                        <rect x="32" y="19" width="5" height="22" rx="2.5" fill="url(#logoGrad)" />
                        <rect x="40" y="24" width="5" height="12" rx="2.5" fill="url(#logoGrad)" />
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h1 className="login-title">Futuristic Login</h1>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-shake">
                        <p className="text-red-400 text-sm font-medium text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="login-label">Access Identity</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="login-label">Secure Key</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-btn group"
                    >
                        {loading ? <div className="spinner mx-auto" /> : (
                            <span className="relative z-10">INITIALIZE SESSION</span>
                        )}
                    </button>
                </form>

                <div className="signup-link">
                    New to the future? <Link to="/register">Create Identity</Link>
                </div>
            </div>
        </div>
    );
}

