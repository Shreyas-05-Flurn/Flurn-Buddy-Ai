import React, { useState } from 'react';
import Header from '../components/Header';
import EarTrainingGame from '../components/EarTrainingGame';
import SightReadingGame from '../components/SightReadingGame';
import ChordInvadersGame from '../components/ChordInvadersGame';
import MagicKeysGame from '../components/MagicKeysGame';

type Game = 'ear_training' | 'sight_reading_rush' | 'chord_invaders' | 'magic_keys' | null;

const PracticeHubScreen: React.FC = () => {
    const [activeGame, setActiveGame] = useState<Game>(null);

    const renderGameMenu = () => (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-green-400">Practice Hub</h2>
                <p className="text-slate-400">Hone your skills with fun mini-games!</p>
            </div>
            <div className="space-y-4">
                <div 
                    onClick={() => setActiveGame('magic_keys')}
                    className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-teal-400">
                        <span className="text-4xl">🎹✨</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-100">Magic Keys (AR Mode)</h3>
                        <p className="text-sm text-slate-400">Play notes on your real keyboard with an AR guide.</p>
                    </div>
                </div>
                <div 
                    onClick={() => setActiveGame('ear_training')}
                    className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-cyan-400">
                        <span className="text-4xl">👂</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-100">Ear Training</h3>
                        <p className="text-sm text-slate-400">Listen to a note and guess it on the keyboard.</p>
                    </div>
                </div>
                
                <div 
                    onClick={() => setActiveGame('sight_reading_rush')}
                    className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-rose-400">
                        <span className="text-4xl">🎼</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-100">Sight-Reading Rush</h3>
                        <p className="text-sm text-slate-400">Play the notes before they scroll past!</p>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveGame('chord_invaders')}
                    className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-purple-400">
                        <span className="text-4xl">👾</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-100">Chord Invaders</h3>
                        <p className="text-sm text-slate-400">Play chords to stop the invaders.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActiveGame = () => {
        switch (activeGame) {
            case 'ear_training':
                return <EarTrainingGame onExit={() => setActiveGame(null)} />;
            case 'sight_reading_rush':
                return <SightReadingGame onExit={() => setActiveGame(null)} />;
            case 'chord_invaders':
                return <ChordInvadersGame onExit={() => setActiveGame(null)} />;
            case 'magic_keys':
                return <MagicKeysGame onExit={() => setActiveGame(null)} />;
            default:
                return renderGameMenu();
        }
    };

    return (
        <div className="flex flex-col h-full text-white">
            <Header />
            <div className="flex-grow overflow-y-auto no-scrollbar">
                {renderActiveGame()}
            </div>
        </div>
    );
};

export default PracticeHubScreen;