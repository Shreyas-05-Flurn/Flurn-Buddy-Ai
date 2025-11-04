import React from 'react';
import { useUserProgress } from '../context/UserProgressContext';

const Header: React.FC = () => {
    const { progress } = useUserProgress();
    const isBoostActive = progress.xpBoosts.activeUntil && new Date(progress.xpBoosts.activeUntil) > new Date();

    return (
        <header className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
            <div className="flex items-center space-x-2">
                <span className="text-2xl">🎶</span>
                <h1 className="text-2xl font-extrabold text-green-400">Flurn Buddy</h1>
            </div>
            <div className="flex items-center space-x-4 text-slate-200">
                {isBoostActive && (
                    <div className="flex items-center font-bold text-amber-400 animate-pulse">
                        <span className="text-lg">⚡️</span>
                        <span className="ml-1 text-sm">1.5x</span>
                    </div>
                )}
                <div className="flex items-center font-bold text-orange-400">
                    <span>🔥</span>
                    <span className="ml-1">{progress.streak}</span>
                </div>
                <div className="flex items-center font-bold text-green-400">
                    <span className="text-lg">💎</span>
                    <span className="ml-1">{progress.tokens}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;