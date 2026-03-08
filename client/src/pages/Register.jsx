import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        const res = await register(name, email, password);
        if (res.success) navigate('/');
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
            {/* Logo */}
            <div className="mb-8">
                <svg viewBox="0 0 24 24" fill="#fc3c44" className="w-10 h-10 mx-auto">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
            </div>

            <div className="w-full max-w-sm bg-[#121212] rounded-2xl p-8">
                <h1 className="text-white text-3xl font-bold text-center mb-2">Sign up for free</h1>
                <p className="text-[#A7A7A7] text-sm text-center mb-8">to start listening.</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/40 rounded-md px-4 py-3 mb-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="reg-name" className="text-sm font-semibold text-white block mb-2">
                            What's your name?
                        </label>
                        <input
                            id="reg-name"
                            type="text"
                            className="auth-input"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div>
                        <label htmlFor="reg-email" className="text-sm font-semibold text-white block mb-2">
                            What's your email?
                        </label>
                        <input
                            id="reg-email"
                            type="email"
                            className="auth-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label htmlFor="reg-password" className="text-sm font-semibold text-white block mb-2">
                            Create a password
                        </label>
                        <input
                            id="reg-password"
                            type="password"
                            className="auth-input"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                        <p className="text-[#A7A7A7] text-xs mt-1">Use at least 6 characters.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-[#fc3c44] hover:bg-[#fa313a] text-white font-bold py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        id="register-submit-btn"
                    >
                        {loading ? <span className="spinner" /> : 'Sign Up'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="border-t border-[#3E3E3E]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-[#121212] px-3 text-[#A7A7A7] text-sm">or</span>
                    </div>
                </div>

                <p className="text-center text-[#A7A7A7] text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold hover:underline">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
