// --- screens/AuthScreen.tsx ---
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signUpWithEmailAndPassword } from '../firebase';
import { useSoundEffects } from '../audio/useSoundEffects';
import { audioService } from '../audio/AudioService';

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { playClick } = useSoundEffects();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // This user gesture (click) is used to unlock the global audio context.
        // This allows the onboarding story audio to play automatically after login.
        playClick();
        await audioService.resumeContext();

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(email, password);
            } else {
                await signUpWithEmailAndPassword(email, password);
            }
            // On success, the AuthContext will handle navigation automatically
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-green-400 mb-6">
                <span className="text-8xl">🎶</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome to Flurn Buddy!</h1>
            <p className="text-slate-300 text-lg mb-8">
                {isLogin ? 'Log in to continue your journey.' : 'Create an account to start learning.'}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 mb-4"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 mb-4"
                />

                {error && <p className="text-red-400 mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 disabled:bg-slate-600 transition-all"
                >
                    {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <button
                onClick={() => setIsLogin(!isLogin)}
                className="mt-6 text-green-400 font-semibold"
            >
                {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
            </button>
        </div>
    );
};

export default AuthScreen;