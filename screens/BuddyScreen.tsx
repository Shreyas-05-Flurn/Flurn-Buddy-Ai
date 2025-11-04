import React, { useState } from 'react';
import Header from '../components/Header';
import AiTutor from '../components/AiTutor';
import PerformanceCoach from '../components/PerformanceCoach';
import PracticeWeaver from '../components/PracticeWeaver';
import BeatMaker from '../components/BeatMaker';

type Feature = 'talk' | 'coach' | 'weaver' | 'beat_maker';

const BuddyScreen: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
    const [isTutorOpen, setIsTutorOpen] = useState(false);

    const features = [
        { id: 'talk' as Feature, emoji: '💬', title: 'Talk to Buddy', description: 'Ask any music theory question.', color: 'text-green-400' },
        { id: 'coach' as Feature, emoji: '🙌', title: 'Performance Coach', description: 'Get feedback on your playing posture.', color: 'text-sky-400' },
        { id: 'weaver' as Feature, emoji: '✨', title: 'Practice Weaver', description: 'Get a personalized practice session.', color: 'text-amber-400' },
        { id: 'beat_maker' as Feature, emoji: '🎧', title: 'Buddy\'s Beat Maker', description: 'Create your own tunes.', color: 'text-rose-400' },
    ];

    const handleFeatureClick = (id: Feature) => {
        if (id === 'talk') {
            setIsTutorOpen(true);
        } else {
            setActiveFeature(id);
        }
    };

    const renderMenu = () => (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-green-400">Buddy Hub 🎶</h2>
                <p className="text-slate-400">Your personal AI music companion!</p>
            </div>
            <div className="space-y-4">
                {features.map(feature => (
                    <div 
                        key={feature.id}
                        onClick={() => handleFeatureClick(feature.id)}
                        className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                        <div className={`w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center ${feature.color}`}>
                            <span className="text-4xl">{feature.emoji}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-100">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActiveFeature = () => {
        switch (activeFeature) {
            case 'coach':
                return <PerformanceCoach onExit={() => setActiveFeature(null)} />;
            case 'weaver':
                return <PracticeWeaver onExit={() => setActiveFeature(null)} />;
            case 'beat_maker':
                return <BeatMaker onExit={() => setActiveFeature(null)} />;
            default:
                return renderMenu();
        }
    };
    
    return (
        <div className="flex flex-col h-full text-white">
            <Header />
            <div className="flex-grow overflow-y-auto no-scrollbar">
                {renderActiveFeature()}
            </div>
            <AiTutor isOpen={isTutorOpen} onClose={() => setIsTutorOpen(false)} />
        </div>
    );
};

export default BuddyScreen;