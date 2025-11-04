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
import { Lesson, World } from './types';

export type Screen = 'onboarding' | 'home' | 'lesson' | 'profile' | 'leaderboard' | 'practice' | 'buddy';

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

    return (
        <div className="relative w-full h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
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
