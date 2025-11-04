import React, { useState, useCallback } from 'react';
import { UserProgressProvider, useUserProgress } from './context/UserProgressContext';
import { AuthProvider, useAuth } from './AuthContext';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PracticeHubScreen from './screens/PracticeHubScreen';
import BuddyScreen from './screens/BuddyScreen';
import BottomNav from './components/BottomNav';
import AuthScreen from './screens/AuthScreen';
import { Lesson, World, Screen } from './types';
import { SHOP_COSMETICS } from './constants';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
};

const AppRouter: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-900">
                <span className="text-4xl animate-pulse">🎶</span>
            </div>
        );
    }
    
    // If user is logged in, provide the UserProgress and show the main app.
    // Otherwise, show the authentication screen.
    return currentUser ? (
        <UserProgressProvider>
            <MainApp />
        </UserProgressProvider>
    ) : (
        <AuthScreen />
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

    const endLesson = useCallback(() => {
        setActiveLesson(null);
        setCurrentScreen('home');
    }, []);

    // If progress is loaded but user hasn't onboarded, force onboarding screen.
    if (progress.hasOnboarded === false && currentScreen !== 'onboarding') {
         setCurrentScreen('onboarding');
    }

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
