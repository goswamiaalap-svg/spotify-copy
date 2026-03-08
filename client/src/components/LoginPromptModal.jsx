import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPromptModal() {
    const navigate = useNavigate();
    const { closeLoginModal } = useAuthStore();

    const handleSignup = () => {
        closeLoginModal();
        navigate('/register');
    };

    const handleLogin = () => {
        closeLoginModal();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg login-modal-card p-10 md:p-12 text-center">
                <button
                    onClick={closeLoginModal}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>

                <div className="flex justify-center mb-8">
                    <img src="/spotify-logo.png" alt="Spotify" className="h-12 w-auto brightness-0 invert opacity-90"
                        onError={(e) => { e.target.src = 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/08/Spotify_Logo_RGB_White.png' }} />
                </div>

                <h2 className="text-white text-3xl font-black mb-4 leading-tight">
                    Start listening with a <br /> free Spotify account
                </h2>

                <p className="description-text mx-auto mb-10 text-base">
                    Join millions of music fans already using our platform to discover and save their favorite artists and songs.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleSignup}
                        className="w-full btn-primary py-4 text-black text-lg"
                    >
                        Sign up free
                    </button>

                    <div className="pt-4">
                        <p className="text-[#a7a7a7] font-bold mb-4">Already have an account?</p>
                        <button
                            onClick={handleLogin}
                            className="w-full py-4 border-2 border-white/20 hover:border-white text-white rounded-full font-bold text-lg transition-all"
                        >
                            Log in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
