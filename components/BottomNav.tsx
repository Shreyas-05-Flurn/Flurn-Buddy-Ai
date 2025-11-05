import React from 'react';
// FIX: Import Screen type from the centralized types.ts file.
import { Screen } from '../types';
import { useSoundEffects } from '../audio/useSoundEffects';

interface BottomNavProps {
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
    const { playClick } = useSoundEffects();
    
    const navItems = [
        { screen: 'home' as Screen, emoji: '🏠', label: 'Learn' },
        { screen: 'practice' as Screen, emoji: '🎮', label: 'Practice' },
        { screen: 'buddy' as Screen, emoji: '🎶', label: 'Buddy' },
        { screen: 'leaderboard' as Screen, emoji: '🏆', label: 'Rank' },
        { screen: 'profile' as Screen, emoji: '👤', label: 'Profile' },
    ];

    const handleNavigation = (screen: Screen) => {
        playClick();
        onNavigate(screen);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-t-lg">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = currentScreen === item.screen;
                    return (
                        <button
                            key={item.screen}
                            onClick={() => handleNavigation(item.screen)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                                isActive ? 'text-green-400' : 'text-slate-400 hover:text-green-400'
                            }`}
                        >
                            <span className="text-2xl mb-1">{item.emoji}</span>
                            <span className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-slate-400'}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;