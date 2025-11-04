import React from 'react';
import Header from '../components/Header';
import { useUserProgress } from '../context/UserProgressContext';

const GardenScreen: React.FC = () => {
    const { progress } = useUserProgress();
    const streak = progress.streak;

    const getGardenContent = () => {
        if (streak === 0) {
            return {
                emoji: '🪴',
                title: 'An empty pot',
                message: 'Your garden is ready. Complete a lesson today to plant a seed and start your streak!',
                size: 'text-8xl',
            };
        }
        if (streak <= 3) {
            return {
                emoji: '🌱',
                title: 'A tiny sprout!',
                message: `You're on a ${streak}-day streak. Keep nurturing your sprout with daily practice!`,
                size: 'text-8xl',
            };
        }
        if (streak <= 7) {
            return {
                emoji: '🌿',
                title: 'It\'s growing!',
                message: `A ${streak}-day streak! Your plant is getting stronger. Don't miss a day.`,
                size: 'text-9xl',
            };
        }
        if (streak <= 14) {
            return {
                emoji: '🌳',
                title: 'A healthy tree!',
                message: `Amazing, a ${streak}-day streak! Your consistency is helping your tree flourish.`,
                size: 'text-9xl',
            };
        }
        if (streak <= 29) {
            return {
                emoji: '🌸',
                title: 'It\'s blooming!',
                message: `Incredible ${streak}-day streak! Your garden is in full bloom.`,
                size: 'text-9xl',
            };
        }
        return {
            emoji: '🍎',
            title: 'A fruit-bearing tree!',
            message: `A legendary ${streak}-day streak! You are a true master of consistency.`,
            size: 'text-9xl',
        };
    };

    const { emoji, title, message, size } = getGardenContent();

    return (
        <div className="flex flex-col h-full text-white">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className={`${size}`}>{emoji}</div>
                <h2 className="text-3xl font-extrabold text-green-400">{title}</h2>
                <p className="text-slate-300 text-lg max-w-xs">{message}</p>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-orange-400">{progress.streak}</p>
                    <p className="text-sm text-slate-400">Current Streak 🔥</p>
                </div>
            </div>
        </div>
    );
};

export default GardenScreen;
