import React from 'react';
import Header from '../components/Header';
import { WORLDS_DATA } from '../constants';
import { Lesson, World } from '../types';
import PathNodeDisplay from '../components/PathNodeDisplay';
import { useUserProgress } from '../context/UserProgressContext';
import DailyQuests from '../components/DailyQuests';

interface HomeScreenProps {
    onStartLesson: (world: World, lesson: Lesson) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartLesson }) => {
    const { progress } = useUserProgress();
    
    const isLessonUnlocked = (worldIndex: number, lessonIndex: number): boolean => {
        if (progress.isDevMode) return true; // Dev mode unlocks all lessons
        
        if (worldIndex === 0 && lessonIndex === 0) return true; // First lesson is always unlocked
        
        const previousLesson = lessonIndex > 0 
            ? WORLDS_DATA[worldIndex].lessons[lessonIndex - 1]
            : (worldIndex > 0 ? WORLDS_DATA[worldIndex - 1].lessons[WORLDS_DATA[worldIndex - 1].lessons.length - 1] : null);

        if (!previousLesson) return false;
        
        return progress.completedLessons.includes(previousLesson.id);
    };

    return (
        <div className="flex flex-col h-full text-white">
            <Header />
            <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                <DailyQuests />
                {WORLDS_DATA.map((world, worldIndex) => (
                    <div key={world.id}>
                        <div className={`p-4 rounded-t-xl ${world.color}`}>
                            <h2 className="text-2xl font-bold text-white">{world.title}</h2>
                            <p className="text-white/80">{world.description}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-b-xl space-y-4">
                            {world.lessons.map((lesson, lessonIndex) => (
                                <PathNodeDisplay
                                    key={lesson.id}
                                    lesson={lesson}
                                    isCompleted={progress.completedLessons.includes(lesson.id)}
                                    isUnlocked={isLessonUnlocked(worldIndex, lessonIndex)}
                                    onStart={() => onStartLesson(world, lesson)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;
