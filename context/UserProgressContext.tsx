import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProgress, Quest, Friend } from '../types';
import { XP_PER_LEVEL, WORLDS_DATA, DAILY_QUEST_DEFINITIONS, MOCK_INITIAL_FRIENDS } from '../constants';

const defaultProgress: UserProgress = {
    hasOnboarded: false,
    xp: 0,
    level: 1,
    tokens: 0,
    streak: 0,
    lastCompletedDate: null,
    completedLessons: [],
    unlockedAchievements: [],
    openedChests: [],
    isDevMode: false,
    nickname: 'New Pianist',
    avatar: '🎹',
    streakFreezes: 0,
    xpBoosts: { count: 0, activeUntil: null },
    classCredits: 0,
    friends: MOCK_INITIAL_FRIENDS,
    dailyQuests: { quests: [], lastRefreshed: null },
    league: { tier: 'Bronze', xp: 0, lastCalculated: null },
};

export const SHOP_ITEMS = {
    streakFreeze: { cost: 100 },
    xpBoost: { cost: 250 },
    classCredit: { cost: 2000 },
};

interface UserProgressContextType {
    progress: UserProgress;
    completeOnboarding: () => void;
    completeLesson: (lessonId: string, xp: number, tokens: number, worldId: string) => void;
    openChest: (chestId: string, tokens: number) => void;
    toggleDevMode: () => void;
    purchaseItem: (itemName: keyof typeof SHOP_ITEMS) => void;
    claimQuestReward: (questId: string) => void;
    addFriend: (name: string) => void;
    sendGift: (friendId: string, item: 'streakFreeze') => boolean;
    setStreak: (streak: number) => void;
    updateProfile: (newNickname: string, newAvatar: string) => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [progress, setProgress] = useState<UserProgress>(() => {
        try {
            const savedProgress = localStorage.getItem('userProgress');
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                const hydratedProgress = { ...defaultProgress };

                // Overwrite defaults with saved values, ensuring no 'undefined' properties
                // and deep-merging nested objects to prevent crashes from old save structures.
                (Object.keys(defaultProgress) as Array<keyof UserProgress>).forEach(key => {
                    if (parsed[key] !== undefined) {
                        const existingValue = hydratedProgress[key];
                        if (typeof existingValue === 'object' && !Array.isArray(existingValue) && existingValue !== null) {
                            // For nested objects like xpBoosts, dailyQuests, league
                            // FIX: Cast to 'any' to handle complex union types for dynamic property assignment.
                            (hydratedProgress as any)[key] = { ...existingValue, ...parsed[key] };
                        } else {
                            // For primitives and arrays
                            // FIX: Cast to 'any' to handle complex union types for dynamic property assignment.
                            (hydratedProgress as any)[key] = parsed[key];
                        }
                    }
                });
                return hydratedProgress;
            }
            return defaultProgress;
        } catch (error) {
            console.error("Failed to load progress from localStorage", error);
            return defaultProgress;
        }
    });

    // --- Utility Functions ---
    const generateDailyQuests = (): Quest[] => {
        const shuffled = [...DAILY_QUEST_DEFINITIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, isClaimed: false }));
    };

    // --- Effects ---
    useEffect(() => {
        try {
            localStorage.setItem('userProgress', JSON.stringify(progress));
        } catch (error) {
            console.error("Failed to save progress to localStorage", error);
        }
    }, [progress]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (progress.dailyQuests.lastRefreshed !== today) {
            setProgress(prev => ({
                ...prev,
                dailyQuests: {
                    quests: generateDailyQuests(),
                    lastRefreshed: today,
                }
            }));
        }
    }, []); // Runs once on app load


    // --- Context Functions ---
    const completeOnboarding = useCallback(() => {
        setProgress(prev => ({ ...prev, hasOnboarded: true }));
    }, []);

    const completeLesson = useCallback((lessonId: string, xp: number, tokens: number, worldId: string) => {
        setProgress(prev => {
            // --- Streak Logic ---
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            let newStreak = prev.streak;
            let newStreakFreezes = prev.streakFreezes;
            if (prev.lastCompletedDate !== today) {
                if (prev.lastCompletedDate === yesterday) {
                    newStreak += 1;
                } else if (prev.streak > 0 && prev.streakFreezes > 0) {
                    newStreakFreezes -= 1; // Use a freeze
                } else if (prev.lastCompletedDate !== null) {
                    newStreak = 1;
                }
            }
            if (prev.streak === 0) newStreak = 1;


            // --- XP Boost Logic ---
            let finalXp = xp;
            if (prev.xpBoosts.activeUntil && new Date(prev.xpBoosts.activeUntil) > new Date()) {
                finalXp = Math.round(xp * 1.5);
            }
            const newXp = prev.xp + finalXp;
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
            
            // --- Token Bonus Logic ---
            const isFirstCompletion = !prev.completedLessons.includes(lessonId);
            let bonusTokens = 0;
            const world = WORLDS_DATA.find(w => w.id === worldId);
            if (world && isFirstCompletion) {
                const lastLessonInWorld = world.lessons[world.lessons.length - 1];
                if (lessonId === lastLessonInWorld.id) {
                    bonusTokens = 20;
                }
            }

            // --- Daily Quest Progress ---
            const updatedQuests = prev.dailyQuests.quests.map(q => {
                if (q.isClaimed) return q;
                let newProgress = q.progress;
                if (q.type === 'earn_xp') {
                    newProgress += finalXp;
                } else if (q.type === 'complete_lessons') {
                    newProgress += 1;
                }
                return { ...q, progress: Math.min(newProgress, q.target) };
            });

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                tokens: prev.tokens + tokens + bonusTokens,
                streak: newStreak,
                streakFreezes: newStreakFreezes,
                lastCompletedDate: today,
                completedLessons: isFirstCompletion ? [...prev.completedLessons, lessonId] : prev.completedLessons,
                dailyQuests: { ...prev.dailyQuests, quests: updatedQuests },
                league: { ...prev.league, xp: prev.league.xp + finalXp },
            };
        });
    }, []);

    const claimQuestReward = useCallback((questId: string) => {
        setProgress(prev => {
            const quest = prev.dailyQuests.quests.find(q => q.id === questId);
            if (!quest || quest.isClaimed || quest.progress < quest.target) {
                return prev;
            }

            const updatedQuests = prev.dailyQuests.quests.map(q =>
                q.id === questId ? { ...q, isClaimed: true } : q
            );

            return {
                ...prev,
                tokens: prev.tokens + quest.reward.tokens,
                dailyQuests: { ...prev.dailyQuests, quests: updatedQuests },
            };
        });
    }, []);

    const openChest = useCallback((chestId: string, tokens: number) => {
        // This function can be expanded for future use
    }, []);
    
    const toggleDevMode = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            isDevMode: !prev.isDevMode,
            tokens: !prev.isDevMode ? 100000 : prev.tokens,
        }));
    }, []);

    const purchaseItem = useCallback((itemName: keyof typeof SHOP_ITEMS) => {
        setProgress(prev => {
            const item = SHOP_ITEMS[itemName];
            if (prev.tokens < item.cost) return prev;

            const newTokens = prev.tokens - item.cost;
            let updatedState: UserProgress = { ...prev, tokens: newTokens };

            switch(itemName) {
                case 'streakFreeze':
                    updatedState.streakFreezes = prev.streakFreezes + 1;
                    break;
                case 'xpBoost':
                    const currentActiveUntil = prev.xpBoosts.activeUntil ? new Date(prev.xpBoosts.activeUntil) : new Date(0);
                    const now = new Date();
                    const startTime = now > currentActiveUntil ? now : currentActiveUntil;
                    const newActiveUntil = new Date(startTime.getTime() + 10 * 60 * 1000);
                    updatedState.xpBoosts = { count: prev.xpBoosts.count + 1, activeUntil: newActiveUntil.toISOString() };
                    break;
                case 'classCredit':
                    updatedState.classCredits = prev.classCredits + 1;
                    break;
            }
            return updatedState;
        });
    }, []);

    const addFriend = useCallback((name: string) => {
        setProgress(prev => {
            const newFriend: Friend = {
                id: `f${Date.now()}`,
                name: name,
                xp: Math.floor(Math.random() * 2000),
                avatar: '🙂',
            };
            return { ...prev, friends: [...prev.friends, newFriend] };
        });
    }, []);

    const sendGift = useCallback((friendId: string, item: 'streakFreeze'): boolean => {
        let success = false;
        setProgress(prev => {
            if (item === 'streakFreeze' && prev.streakFreezes > 0) {
                success = true;
                // In a real app, this would send a notification to the friend
                return { ...prev, streakFreezes: prev.streakFreezes - 1 };
            }
            return prev;
        });
        return success;
    }, []);

    const setStreak = useCallback((newStreak: number) => {
        if (!isNaN(newStreak) && newStreak >= 0) {
            setProgress(prev => ({
                ...prev,
                streak: newStreak,
            }));
        }
    }, []);

    const updateProfile = useCallback((newNickname: string, newAvatar: string) => {
        setProgress(prev => ({
            ...prev,
            nickname: newNickname,
            avatar: newAvatar,
        }));
    }, []);

    const value = { progress, completeOnboarding, completeLesson, openChest, toggleDevMode, purchaseItem, claimQuestReward, addFriend, sendGift, setStreak, updateProfile };

    return (
        <UserProgressContext.Provider value={value}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = (): UserProgressContextType => {
    const context = useContext(UserProgressContext);
    if (!context) {
        throw new Error('useUserProgress must be used within a UserProgressProvider');
    }
    return context;
};