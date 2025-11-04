import React from 'react';
import { Lesson } from '../types';

interface PathNodeDisplayProps {
    lesson: Lesson;
    isCompleted: boolean;
    isUnlocked: boolean;
    onStart: () => void;
}

const PathNodeDisplay: React.FC<PathNodeDisplayProps> = ({ lesson, isCompleted, isUnlocked, onStart }) => {

    const getIcon = () => {
        switch (lesson.type) {
            case 'boss':
                return '⭐';
            default:
                return '🎓';
        }
    };

    const nodeColor = isCompleted ? 'bg-yellow-500' : isUnlocked ? 'bg-green-500' : 'bg-slate-600';
    const textColor = isUnlocked ? 'text-white' : 'text-slate-400';
    const buttonText = isCompleted ? 'Replay' : 'Start';

    return (
        <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${nodeColor} ${isUnlocked ? 'shadow-lg' : ''} transition-all`}>
                <div className={isUnlocked ? 'text-white' : 'text-slate-400'}>
                    <span className="text-3xl">{getIcon()}</span>
                </div>
            </div>
            <div className="flex-1">
                <h3 className={`font-bold text-lg ${textColor}`}>{lesson.title}</h3>
                <p className="text-sm text-slate-400">{lesson.xp} XP</p>
            </div>
            {isUnlocked && (
                <button
                    onClick={onStart}
                    className={`px-6 py-2 rounded-xl font-bold text-white transition-colors
                        ${isCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default PathNodeDisplay;