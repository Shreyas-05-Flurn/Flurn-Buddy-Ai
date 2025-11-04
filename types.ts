// FIX: Removed self-import of Friend, Quest, and League which conflicted with local declarations.
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
    xpBoosts: {
        count: number;
        activeUntil: string | null;
    };
    classCredits: number;
    friends: Friend[];
    dailyQuests: DailyQuestState;
    league: League;
}

export type LessonType = 'note_identification' | 'chord_identification' | 'rhythm_challenge' | 'ear_training' | 'quiz' | 'boss' | 'song';

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Lesson {
    id: string;
    type: LessonType;
    title: string;
    xp: number;
    tokens: number;
    content: any; // This will vary based on lesson type
    fact?: string; // Optional fun fact after lesson
}

export interface World {
    id:string;
    title: string;
    description: string;
    color: string; // e.g., 'bg-green-500'
    lessons: Lesson[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // e.g., emoji '🏆'
}

// --- New Feature Types ---

export interface Friend {
    id: string;
    name: string;
    xp: number;
    avatar: string;
}

export type QuestType = 'earn_xp' | 'complete_lessons' | 'perfect_notes'; // perfect_notes is for future use
export interface Quest {
    id: string;
    type: QuestType;
    description: string;
    target: number;
    progress: number;
    reward: { tokens: number };
    isClaimed: boolean;
}

export interface DailyQuestState {
    quests: Quest[];
    lastRefreshed: string | null;
}

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export interface League {
    tier: LeagueTier;
    xp: number;
    lastCalculated: string | null;
}

export interface BeatStep {
    note: string;
    isActive: boolean;
}

export interface BeatTrack {
    id: number;
    steps: BeatStep[];
}