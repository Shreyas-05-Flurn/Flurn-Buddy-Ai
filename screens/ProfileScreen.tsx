import React, { useState } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { XP_PER_LEVEL, SELECTABLE_AVATARS } from '../constants';
import Header from '../components/Header';
import ShopScreen from './ShopScreen';

const ProfileScreen: React.FC = () => {
    const { progress, toggleDevMode, addFriend, sendGift, setStreak, updateProfile } = useUserProgress();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [tempNickname, setTempNickname] = useState(progress.nickname);
    const [tempAvatar, setTempAvatar] = useState(progress.avatar);
    const [newFriendName, setNewFriendName] = useState('');
    const [giftFeedback, setGiftFeedback] = useState('');
    const [streakInput, setStreakInput] = useState('');
    
    const xpForCurrentLevel = progress.xp % XP_PER_LEVEL;
    const progressPercentage = (xpForCurrentLevel / XP_PER_LEVEL) * 100;

    const handleSaveProfile = () => {
        if (tempNickname.trim()) {
            updateProfile(tempNickname.trim(), tempAvatar);
            setIsEditModalOpen(false);
        }
    };

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFriendName.trim()) {
            addFriend(newFriendName.trim());
            setNewFriendName('');
        }
    };

    const handleSendGift = (friendId: string) => {
        if (progress.streakFreezes > 0) {
            const success = sendGift(friendId, 'streakFreeze');
            if (success) {
                setGiftFeedback('🎁 Gift sent!');
                setTimeout(() => setGiftFeedback(''), 2000);
            }
        } else {
            setGiftFeedback('Not enough Streak Freezes!');
            setTimeout(() => setGiftFeedback(''), 2000);
        }
    };

    const handleSetStreak = (e: React.FormEvent) => {
        e.preventDefault();
        const newStreak = parseInt(streakInput, 10);
        if (!isNaN(newStreak)) {
            setStreak(newStreak);
            setStreakInput('');
        }
    };

    const getGardenContent = () => {
        const streak = progress.streak;
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center"><span className="text-5xl">{progress.avatar}</span></div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">{progress.nickname}</h2>
                        <p className="text-slate-400">Level {progress.level}</p>
                    </div>
                    <button onClick={() => {
                        setTempNickname(progress.nickname);
                        setTempAvatar(progress.avatar);
                        setIsEditModalOpen(true);
                    }} className="ml-auto bg-slate-700 text-sm font-bold py-1 px-3 rounded-lg hover:bg-slate-600 transition-colors">
                        Edit
                    </button>
                </div>
                
                {/* Shop Button */}
                <button 
                    onClick={() => setIsShopOpen(true)}
                    className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20 hover:bg-green-600 transform hover:scale-105 transition-all"
                >
                    <span className="text-2xl">🛒</span>
                    <span>Go to Shop</span>
                </button>

                {/* XP Progress Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm font-bold text-slate-300">
                        <span>XP Progress</span><span>{progress.xp} / {(progress.level) * XP_PER_LEVEL}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                        <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-800 p-4 rounded-lg"><p className="text-3xl font-bold text-orange-400">{progress.streak}</p><p className="text-sm text-slate-400">Day Streak 🔥</p></div>
                    <div className="bg-slate-800 p-4 rounded-lg"><p className="text-3xl font-bold text-green-400">{progress.completedLessons.length}</p><p className="text-sm text-slate-400">Lessons Done</p></div>
                    <div className="bg-slate-800 p-4 rounded-lg"><p className="text-3xl font-bold text-green-400">{progress.tokens}</p><p className="text-sm text-slate-400">Tokens</p></div>
                    <div className="bg-slate-800 p-4 rounded-lg"><p className="text-3xl font-bold text-violet-400">{progress.xp}</p><p className="text-sm text-slate-400">Total XP</p></div>
                </div>

                {/* Note Garden */}
                <div>
                    <h3 className="text-xl font-bold text-slate-200 mb-3">Your Note Garden 🌱</h3>
                    <div className="bg-slate-800 p-4 rounded-lg text-center">
                        <div className={`${size} my-4`}>{emoji}</div>
                        <h4 className="text-xl font-bold text-green-400">{title}</h4>
                        <p className="text-slate-300 mt-2 max-w-xs mx-auto">{message}</p>
                    </div>
                </div>
                
                {/* Friends Section */}
                <div>
                    <h3 className="text-xl font-bold text-slate-200 mb-3">Friends</h3>
                    <div className="space-y-3 bg-slate-800 p-4 rounded-lg">
                        {progress.friends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">{friend.avatar}</span>
                                    <div>
                                        <p className="font-bold text-slate-200">{friend.name}</p>
                                        <p className="text-sm text-yellow-400">{friend.xp} XP</p>
                                    </div>
                                </div>
                                <button onClick={() => handleSendGift(friend.id)} disabled={progress.streakFreezes <= 0} className="text-2xl disabled:opacity-50">🎁</button>
                            </div>
                        ))}
                        <form onSubmit={handleAddFriend} className="flex space-x-2 pt-3 border-t border-slate-700">
                            <input type="text" value={newFriendName} onChange={(e) => setNewFriendName(e.target.value)} placeholder="Add friend by name..." className="flex-1 bg-slate-700 text-sm p-2 rounded"/>
                            <button type="submit" className="bg-green-500 font-bold px-3 rounded">Add</button>
                        </form>
                        {giftFeedback && <p className="text-center text-green-400 mt-2 font-bold">{giftFeedback}</p>}
                    </div>
                </div>

                {/* Developer Mode */}
                <div className="bg-slate-800 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-200">Developer Mode</h3>
                            <p className="text-sm text-slate-400">Unlock all lessons & get 100,000 tokens.</p>
                        </div>
                        <button onClick={toggleDevMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${progress.isDevMode ? 'bg-green-500' : 'bg-slate-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${progress.isDevMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {progress.isDevMode && (
                        <form onSubmit={handleSetStreak} className="flex space-x-2 pt-4 border-t border-slate-700">
                             <input 
                                type="number" 
                                value={streakInput} 
                                onChange={(e) => setStreakInput(e.target.value)} 
                                placeholder="Set custom streak..." 
                                className="flex-1 bg-slate-700 text-sm p-2 rounded w-full"
                             />
                             <button type="submit" className="bg-green-500 font-bold px-4 rounded">Set</button>
                        </form>
                    )}
                </div>
            </div>
            
            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
                        <label className="text-sm font-bold text-slate-400">Nickname</label>
                        <input 
                            type="text"
                            value={tempNickname}
                            onChange={(e) => setTempNickname(e.target.value)}
                            className="w-full bg-slate-700 text-white p-2 rounded mt-1 mb-4"
                        />
                        <label className="text-sm font-bold text-slate-400 block">Avatar</label>
                        <div className="grid grid-cols-6 gap-2 mt-2 bg-slate-900/50 p-2 rounded-lg">
                            {SELECTABLE_AVATARS.map(avatar => (
                                <button
                                    key={avatar}
                                    onClick={() => setTempAvatar(avatar)}
                                    className={`text-3xl rounded-lg p-1 transition-all ${tempAvatar === avatar ? 'bg-green-500 ring-2 ring-white' : 'hover:bg-slate-700'}`}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSaveProfile} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {isShopOpen && <ShopScreen onClose={() => setIsShopOpen(false)} />}
        </div>
    );
};

export default ProfileScreen;