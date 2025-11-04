import React, { useState } from 'react';
import PianoKeyboard from './PianoKeyboard';
import { useAudio } from '../audio/useAudio';

interface EarTrainingGameProps {
    onExit: () => void;
}

const NOTES_TO_PRACTICE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

const EarTrainingGame: React.FC<EarTrainingGameProps> = ({ onExit }) => {
    const { playNote } = useAudio();
    const [noteToGuess, setNoteToGuess] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; color: string } | null>(null);
    const [isRoundActive, setIsRoundActive] = useState(false);

    const startRound = () => {
        const randomNote = NOTES_TO_PRACTICE[Math.floor(Math.random() * NOTES_TO_PRACTICE.length)];
        setNoteToGuess(randomNote);
        setFeedback(null);
        setIsRoundActive(true);
        setTimeout(() => playNote(randomNote), 500);
    };

    const handleNotePress = (pressedNote: string) => {
        if (!isRoundActive || !noteToGuess) return;

        if (pressedNote === noteToGuess) {
            setFeedback({ message: `Correct! It was ${noteToGuess}.`, color: 'text-green-400' });
            playNote(pressedNote);
        } else {
            setFeedback({ message: `Not quite! You played ${pressedNote}, but it was ${noteToGuess}.`, color: 'text-red-400' });
            playNote(pressedNote);
        }
        setIsRoundActive(false);
    };

    return (
        <div className="p-6 flex flex-col items-center h-full">
            <div className="w-full flex justify-between items-center mb-6">
                 <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">
                    &larr; Back to Hub
                </button>
                <h2 className="text-2xl font-bold text-cyan-400">Ear Training</h2>
                <div className="w-24"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
                {!noteToGuess ? (
                    <>
                        <p className="text-lg text-slate-300 mb-6">Press the button to hear a random note, then try to find it on the keyboard.</p>
                        <button onClick={startRound} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                            Start Listening
                        </button>
                    </>
                ) : (
                    <>
                        {feedback ? (
                            <div className="mb-6">
                                <p className={`text-xl font-bold ${feedback.color}`}>{feedback.message}</p>
                                <button onClick={startRound} className="mt-4 bg-green-500 text-white font-bold py-2 px-5 rounded-lg">
                                    Play Again
                                </button>
                            </div>
                        ) : (
                             <p className="text-xl text-slate-300 mb-6 font-semibold animate-pulse">Which note did you hear?</p>
                        )}
                    </>
                )}
            </div>

            <PianoKeyboard onNotePress={handleNotePress} />
        </div>
    );
};

export default EarTrainingGame;