// --- LESSON & WORLD TYPES ---
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface ChordContent {
    name: string;
    notes: string[];
}

export interface SongContent {
    name: string;
    notes: string[];
}

export interface Lesson {
    id: string;
    type: 'note_identification' | 'quiz' | 'boss' | 'chord_identification' | 'song';
    title: string;
    xp: number;
    tokens: number;
    content: string[] | QuizQuestion[] | ChordContent | SongContent;
    fact?: string;
}

export interface World {
    id: string;
    title: string;
    description: string;
    color: string;
    lessons: Lesson[];
}

// --- USER PROGRESS & GAMIFICATION TYPES ---
export interface Quest {
    id: string;
    type: 'earn_xp' | 'complete_lessons';
    description: string;
    target: number;
    reward: { tokens: number };
    progress: number;
    isClaimed: boolean;
}

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface Friend {
    id: string;
    name: string;
    xp: number;
    avatar: string;
}

export interface UserProgress {
    hasOnboarded: boolean;
    xp: number;
    level: number;
    tokens: number;
    streak: number;
    lastCompletedDate: string | null;
    completedLessons: string[];
    unlockedAchievements: string[];
    openedChests: string[];
    isDevMode: boolean;
    nickname: string;
    avatar: string;
    streakFreezes: number;
    xpBoosts: { count: number; activeUntil: string | null };
    classCredits: number;
    friends: Friend[];
    dailyQuests: { quests: Quest[]; lastRefreshed: string | null };
    league: { tier: LeagueTier; xp: number; lastCalculated: string | null };
    inventory: { themes: string[] };
    activeTheme: string;
}

// --- UI & APP STATE TYPES ---
export type Screen = 'onboarding' | 'home' | 'lesson' | 'profile' | 'leaderboard' | 'practice' | 'buddy';

// --- BEAT MAKER TYPES ---
export interface BeatStep {
    note: string;
    isActive: boolean;
}

export interface BeatTrack {
    id: number;
    steps: BeatStep[];
}
