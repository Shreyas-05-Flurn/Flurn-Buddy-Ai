import React, { useState, useCallback } from 'react';
import { UserProgressProvider, useUserProgress } from './context/UserProgressContext';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PracticeHubScreen from './screens/PracticeHubScreen';
import BuddyScreen from './screens/BuddyScreen';
import BottomNav from './components/BottomNav';
// FIX: Import Screen, Lesson, and World types from the corrected types.ts file.
import { Lesson, World, Screen } from './types';
import { SHOP_COSMETICS } from './constants';

// FIX: Screen type is now imported from types.ts to avoid duplication and act as a single source of truth.

const App: React.FC = () => {
    return (
        <UserProgressProvider>
            <MainApp />
        </UserProgressProvider>
    );
};

const MainApp: React.FC = () => {
    const { progress } = useUserProgress();
    const [currentScreen, setCurrentScreen] = useState<Screen>(progress.hasOnboarded ? 'home' : 'onboarding');
    const [activeLesson, setActiveLesson] = useState<{ world: World; lesson: Lesson } | null>(null);

    const handleNavigate = useCallback((screen: Screen) => {
        setCurrentScreen(screen);
    }, []);

    const startLesson = useCallback((world: World, lesson: Lesson) => {
        setActiveLesson({ world, lesson });
        setCurrentScreen('lesson');
    }, []);

    const endLesson = useCallback((completed: boolean) => {
        if (completed && activeLesson) {
             // The completion logic is handled inside LessonScreen via context
        }
        setActiveLesson(null);
        setCurrentScreen('home');
    }, [activeLesson]);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'onboarding':
                return <OnboardingScreen onComplete={() => handleNavigate('home')} />;
            case 'home':
                return <HomeScreen onStartLesson={startLesson} />;
            case 'lesson':
                if (activeLesson) {
                    return <LessonScreen world={activeLesson.world} lesson={activeLesson.lesson} onComplete={endLesson} />;
                }
                // Fallback to home if no active lesson
                setCurrentScreen('home'); 
                return <HomeScreen onStartLesson={startLesson} />;
            case 'profile':
                return <ProfileScreen />;
            case 'leaderboard':
                return <LeaderboardScreen />;
            case 'practice':
                return <PracticeHubScreen />;
            case 'buddy':
                return <BuddyScreen />;
            default:
                return <HomeScreen onStartLesson={startLesson} />;
        }
    };
    
    const showNav = currentScreen !== 'onboarding' && currentScreen !== 'lesson';

    const activeTheme = SHOP_COSMETICS.find(theme => theme.id === progress.activeTheme) || SHOP_COSMETICS[0];

    return (
        <div className={`relative w-full h-screen flex flex-col bg-gradient-to-b ${activeTheme.colors.bgGradient}`}>
            <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                {renderScreen()}
            </main>
            
            {showNav && (
                <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
            )}
        </div>
    );
};

export default App;
