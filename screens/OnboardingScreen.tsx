import React from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { useSoundEffects } from '../audio/useSoundEffects';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { completeOnboarding } = useUserProgress();
    const { playClick } = useSoundEffects();

    const handleStart = () => {
        playClick();
        completeOnboarding();
        onComplete();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
            <div className="text-green-400 mb-6">
                 <span className="text-8xl">🎶</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to Flurn Buddy!</h1>
            <p className="text-slate-300 text-lg mb-12">
                This is Buddy. His world has lost its music! Help him bring it back by completing lessons and restoring harmony.
            </p>
            <button
                onClick={handleStart}
                className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Let's Help Buddy!
            </button>
        </div>
    );
};

export default OnboardingScreen;
