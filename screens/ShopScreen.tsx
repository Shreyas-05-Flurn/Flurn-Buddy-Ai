import React, { useState, useEffect } from 'react';
import { useUserProgress, SHOP_ITEMS } from '../context/UserProgressContext';

interface ShopScreenProps {
    onClose: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onClose }) => {
    const { progress, purchaseItem } = useUserProgress();
    const [xpBoostTimeLeft, setXpBoostTimeLeft] = useState('');

    useEffect(() => {
        const xpBoost = progress.xpBoosts;
        if (!xpBoost.activeUntil) {
            setXpBoostTimeLeft('');
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const endTime = new Date(xpBoost.activeUntil!).getTime();
            const distance = endTime - now;

            if (distance <= 0) {
                clearInterval(intervalId);
                setXpBoostTimeLeft('');
                return;
            }

            const minutes = Math.floor(distance / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setXpBoostTimeLeft(formattedTime);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [progress.xpBoosts.activeUntil]);
    
    const shopItems = [
        {
            id: 'streakFreeze' as const,
            name: 'Streak Freeze',
            description: 'Freezes your streak if you miss practice for one day.',
            cost: SHOP_ITEMS.streakFreeze.cost,
            emoji: '❄️',
            color: 'text-cyan-400',
            owned: progress.streakFreezes,
        },
        {
            id: 'xpBoost' as const,
            name: '1.5x XP Boost',
            description: 'Earn 1.5x XP from lessons for the next 10 minutes.',
            cost: SHOP_ITEMS.xpBoost.cost,
            emoji: '⚡️',
            color: 'text-amber-400',
            owned: progress.xpBoosts.count,
        },
        {
            id: 'classCredit' as const,
            name: 'Class Credit',
            description: 'Redeem for one class credit at Flurn Classes.',
            cost: SHOP_ITEMS.classCredit.cost,
            emoji: '🎟️',
            color: 'text-fuchsia-400',
            owned: progress.classCredits,
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-sm h-[85vh] rounded-2xl flex flex-col shadow-2xl">
                <header className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        <span className="text-3xl text-green-400">🛒</span>
                        <h2 className="text-xl font-bold text-white">Shop</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <span className="text-3xl">❌</span>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <p className="text-slate-400 text-center">Spend your tokens on awesome perks!</p>
                    <div className="text-center font-bold text-2xl text-green-400 flex items-center justify-center">
                        <span className="text-3xl mr-2">💎</span> {progress.tokens}
                    </div>

                    <div className="space-y-4">
                        {shopItems.map((item) => {
                            const hasEnoughTokens = progress.tokens >= item.cost;
                            const isBoostActive = item.id === 'xpBoost' && xpBoostTimeLeft;
                            return (
                                <div key={item.id} className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4">
                                    <div className={`w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center ${item.color}`}>
                                        <span className="text-4xl">{item.emoji}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-100">{item.name}</h3>
                                        <p className="text-sm text-slate-400">{item.description}</p>
                                        <p className="text-xs text-slate-500 font-semibold mt-1">
                                            {isBoostActive ? (
                                                <span className="text-amber-400">Time left: {xpBoostTimeLeft}</span>
                                            ) : (
                                                `You have: ${item.owned}`
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => purchaseItem(item.id)}
                                        disabled={!hasEnoughTokens}
                                        className={`flex items-center justify-center px-4 py-2 rounded-lg font-bold text-white transition-colors w-28
                                            ${hasEnoughTokens
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="text-lg mr-1.5">💎</span>
                                        <span>{item.cost}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopScreen;