import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProgress, Quest, Friend } from '../types';
import { XP_PER_LEVEL, WORLDS_DATA, DAILY_QUEST_DEFINITIONS, MOCK_INITIAL_FRIENDS, SHOP_COSMETICS } from '../constants';
import { useSoundEffects } from '../audio/useSoundEffects';

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
    inventory: { themes: ['default'] },
    activeTheme: 'default',
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
    purchaseItem: (itemName: string, category: 'perk' | 'cosmetic') => void;
    claimQuestReward: (questId: string) => void;
    addFriend: (name: string) => void;
    sendGift: (friendId: string, item: 'streakFreeze') => boolean;
    setStreak: (streak: number) => void;
    updateProfile: (newNickname: string, newAvatar: string) => void;
    equipTheme: (themeId: string) => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { playSuccess } = useSoundEffects();
    const [progress, setProgress] = useState<UserProgress>(() => {
        try {
            const savedProgress = localStorage.getItem('userProgress');
            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);
                const hydratedProgress = { ...defaultProgress };
                (Object.keys(defaultProgress) as Array<keyof UserProgress>).forEach(key => {
                    if (parsed[key] !== undefined) {
                        const existingValue = parsed[key];
                        // Type guard for complex objects to prevent "never" type issues
                        if (typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue)) {
                           (hydratedProgress as any)[key] = { ...(hydratedProgress as any)[key], ...existingValue };
                        } else {
                           (hydratedProgress as any)[key] = existingValue;
                        }
                    }
                });
                return hydratedProgress;
            }
        } catch (error) {
            console.error("Failed to load user progress:", error);
        }
        return defaultProgress;
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        // Check for streak reset
        if (progress.lastCompletedDate && progress.lastCompletedDate !== today) {
            const lastDate = new Date(progress.lastCompletedDate);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                setProgress(prev => {
                    if (prev.streakFreezes > 0) {
                        return { ...prev, streakFreezes: prev.streakFreezes - 1, lastCompletedDate: today };
                    }
                    return { ...prev, streak: 0 };
                });
            }
        }
        
        // Refresh daily quests
        if (!progress.dailyQuests.lastRefreshed || progress.dailyQuests.lastRefreshed !== today) {
            const shuffledQuests = [...DAILY_QUEST_DEFINITIONS].sort(() => 0.5 - Math.random());
            const newQuests: Quest[] = shuffledQuests.slice(0, 3).map(q => ({
                ...q,
                progress: 0,
                isClaimed: false
            }));
            setProgress(prev => ({
                ...prev,
                dailyQuests: {
                    quests: newQuests,
                    lastRefreshed: today
                }
            }));
        }

    }, []); // Run once on app startup


    useEffect(() => {
        try {
            localStorage.setItem('userProgress', JSON.stringify(progress));
        } catch (error) {
            console.error("Failed to save user progress:", error);
        }
    }, [progress]);
    
    const completeOnboarding = useCallback(() => {
        setProgress(prev => ({ ...prev, hasOnboarded: true }));
    }, []);

    const completeLesson = useCallback((lessonId: string, xp: number, tokens: number, worldId: string) => {
        setProgress(prev => {
            const today = new Date().toISOString().split('T')[0];
            let newStreak = prev.streak;
            if (prev.lastCompletedDate !== today) {
                newStreak += 1;
            }

            const isBoostActive = prev.xpBoosts.activeUntil && new Date(prev.xpBoosts.activeUntil) > new Date();
            const finalXp = isBoostActive ? Math.round(xp * 1.5) : xp;
            
            const newTotalXp = prev.xp + finalXp;
            const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;
            
            const newCompletedLessons = prev.completedLessons.includes(lessonId)
                ? prev.completedLessons
                : [...prev.completedLessons, lessonId];
            
            // Check for world completion bonus
            const world = WORLDS_DATA.find(w => w.id === worldId);
            const lastLessonInWorld = world?.lessons[world.lessons.length - 1];
            let bonusTokens = 0;
            if (lastLessonInWorld?.id === lessonId && !prev.completedLessons.includes(lessonId)) {
                bonusTokens = 20; // First time completion bonus
            }
            
            // Update quest progress
            const updatedQuests = prev.dailyQuests.quests.map(quest => {
                if (quest.isClaimed) return quest;
                let newProgress = quest.progress;
                if(quest.type === 'earn_xp') newProgress += finalXp;
                if(quest.type === 'complete_lessons') newProgress += 1;
                return { ...quest, progress: newProgress };
            });

            return {
                ...prev,
                xp: newTotalXp,
                level: newLevel,
                tokens: prev.tokens + tokens + bonusTokens,
                streak: newStreak,
                lastCompletedDate: today,
                completedLessons: newCompletedLessons,
                dailyQuests: { ...prev.dailyQuests, quests: updatedQuests },
                league: { ...prev.league, xp: prev.league.xp + finalXp },
            };
        });
    }, []);

    const openChest = useCallback((chestId: string, tokens: number) => {
        setProgress(prev => ({
            ...prev,
            tokens: prev.tokens + tokens,
            openedChests: [...prev.openedChests, chestId],
        }));
    }, []);

    const toggleDevMode = useCallback(() => {
        setProgress(prev => ({ 
            ...prev, 
            isDevMode: !prev.isDevMode,
            tokens: !prev.isDevMode ? 100000 : prev.tokens,
        }));
    }, []);

    const purchaseItem = useCallback((itemId: string, category: 'perk' | 'cosmetic') => {
        setProgress(prev => {
            if (category === 'perk') {
                 const itemInfo = SHOP_ITEMS[itemId as keyof typeof SHOP_ITEMS];
                if (!itemInfo || prev.tokens < itemInfo.cost) return prev;

                let updatedState = { ...prev, tokens: prev.tokens - itemInfo.cost };

                if (itemId === 'streakFreeze') {
                    updatedState.streakFreezes += 1;
                } else if (itemId === 'xpBoost') {
                    const now = new Date();
                    const currentEndTime = prev.xpBoosts.activeUntil ? new Date(prev.xpBoosts.activeUntil) : now;
                    const newEndTime = new Date(Math.max(now.getTime(), currentEndTime.getTime()) + 10 * 60 * 1000); // Add 10 mins
                    updatedState.xpBoosts = {
                        count: prev.xpBoosts.count + 1,
                        activeUntil: newEndTime.toISOString(),
                    };
                } else if (itemId === 'classCredit') {
                    updatedState.classCredits += 1;
                }
                return updatedState;
            } else if (category === 'cosmetic') {
                const cosmetic = SHOP_COSMETICS.find(c => c.id === itemId);
                if (!cosmetic || prev.tokens < cosmetic.cost || prev.inventory.themes.includes(itemId)) return prev;

                return {
                    ...prev,
                    tokens: prev.tokens - cosmetic.cost,
                    inventory: {
                        ...prev.inventory,
                        themes: [...prev.inventory.themes, itemId],
                    }
                }
            }
            return prev;
        });
    }, []);

    const claimQuestReward = useCallback((questId: string) => {
        setProgress(prev => {
            const quest = prev.dailyQuests.quests.find(q => q.id === questId);
            if (!quest || quest.isClaimed || quest.progress < quest.target) return prev;
            
            const updatedQuests = prev.dailyQuests.quests.map(q => 
                q.id === questId ? { ...q, isClaimed: true } : q
            );

            return {
                ...prev,
                tokens: prev.tokens + quest.reward.tokens,
                dailyQuests: { ...prev.dailyQuests, quests: updatedQuests }
            };
        });
    }, []);

    const addFriend = useCallback((name: string) => {
        setProgress(prev => {
            const newFriend: Friend = {
                id: `f${Date.now()}`,
                name,
                xp: 0,
                avatar: '🧑‍🎤',
            };
            return { ...prev, friends: [...prev.friends, newFriend] };
        });
    }, []);

    const sendGift = useCallback((friendId: string, item: 'streakFreeze') => {
        let success = false;
        setProgress(prev => {
            if (item === 'streakFreeze' && prev.streakFreezes > 0) {
                success = true;
                return { ...prev, streakFreezes: prev.streakFreezes - 1 };
            }
            return prev;
        });
        return success;
    }, []);
    
    const setStreak = useCallback((streak: number) => {
        setProgress(prev => ({ ...prev, streak }));
    }, []);
    
    const updateProfile = useCallback((newNickname: string, newAvatar: string) => {
        setProgress(prev => ({ ...prev, nickname: newNickname, avatar: newAvatar }));
    }, []);

    const equipTheme = useCallback((themeId: string) => {
        setProgress(prev => {
            if (prev.inventory.themes.includes(themeId)) {
                return { ...prev, activeTheme: themeId };
            }
            return prev;
        });
    }, []);

    return (
        <UserProgressContext.Provider value={{
            progress,
            completeOnboarding,
            completeLesson,
            openChest,
            toggleDevMode,
            purchaseItem,
            claimQuestReward,
            addFriend,
            sendGift,
            setStreak,
            updateProfile,
            equipTheme,
        }}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (context === undefined) {
        throw new Error('useUserProgress must be used within a UserProgressProvider');
    }
    return context;
};