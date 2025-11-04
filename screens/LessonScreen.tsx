import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lesson, World, QuizQuestion } from '../types';
import { useUserProgress } from '../context/UserProgressContext';
import PianoKeyboard from '../components/PianoKeyboard';
import Staff from '../components/Staff';
import MultipleChoice from '../components/MultipleChoice';
import FactModal from '../components/FactModal';
import { usePitchDetection } from '../audio/usePitchDetection';
import { useSoundEffects } from '../audio/useSoundEffects';

interface LessonScreenProps {
    world: World;
    lesson: Lesson;
    onComplete: (completed: boolean) => void;
}

const LessonScreen: React.FC<LessonScreenProps> = ({ world, lesson, onComplete }) => {
    const { completeLesson } = useUserProgress();
    const { playSuccess, playError, playClick } = useSoundEffects();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [showFact, setShowFact] = useState(false);
    const [mistakeCount, setMistakeCount] = useState(0);
    const [showClue, setShowClue] = useState(false);
    const [lastSeenNotes, setLastSeenNotes] = useState<string[]>([]);

    const { detectedNotes, isListening, startListening, stopListening, error } = usePitchDetection();
    const feedbackTimeoutRef = useRef<number | null>(null);

    // FIX: Intelligently handle song-like lessons, even if they are 'boss' type.
    const isSongLike = lesson.type === 'song' || (lesson.type === 'boss' && typeof lesson.content === 'object' && lesson.content.notes);
    const lessonContent = isSongLike ? lesson.content.notes : lesson.content;
    const songName = isSongLike ? lesson.content.name : null;
    const totalItems = Array.isArray(lessonContent) ? lessonContent.length : 1;
    
    const progressPercentage = (currentIndex / totalItems) * 100;

    useEffect(() => {
        // Reset state for the new item/question
        setMistakeCount(0);
        setShowClue(false);
        setLastSeenNotes([]);
    }, [currentIndex]);

    const clearFeedbackTimeout = () => {
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }
    };

    const handleCorrect = useCallback(() => {
        clearFeedbackTimeout();
        setIsCorrect(true);
        playSuccess();
        if (isListening) stopListening();

        feedbackTimeoutRef.current = setTimeout(() => {
            if (currentIndex + 1 < totalItems) {
                setCurrentIndex(prev => prev + 1);
                setIsCorrect(null);
            } else {
                setIsComplete(true);
                playSuccess();
                completeLesson(lesson.id, lesson.xp, lesson.tokens, world.id);
                 if (lesson.fact) {
                    setShowFact(true);
                } else {
                    setTimeout(() => onComplete(true), 1000);
                }
            }
        }, 1000);
    }, [currentIndex, totalItems, completeLesson, lesson, world.id, onComplete, isListening, stopListening, playSuccess]);

    const handleIncorrect = useCallback(() => {
        clearFeedbackTimeout();
        setIsCorrect(false);
        playError();
        
        const newMistakeCount = mistakeCount + 1;
        setMistakeCount(newMistakeCount);
        if (newMistakeCount >= 3) {
            setShowClue(true);
        }

        feedbackTimeoutRef.current = setTimeout(() => {
            setIsCorrect(null);
        }, 1200);
    }, [mistakeCount, playError]);
    
    // Effect for chord detection (correctness and mistakes)
    useEffect(() => {
        if (lesson.type === 'chord_identification' && isListening) {
            const targetNoteNames = new Set((lesson.content.notes as string[]).map(n => n.slice(0, -1)));
            const detectedNoteNames = new Set(detectedNotes.map(n => n.slice(0, -1)));

            const allNotesFound = [...targetNoteNames].every(note => detectedNoteNames.has(note));
            if (allNotesFound) {
                handleCorrect();
                return; // Chord is correct, no need to check for mistakes
            }

            const newNotes = detectedNotes.filter(n => !lastSeenNotes.includes(n));
            if (newNotes.length > 0) {
                const newNoteNames = new Set(newNotes.map(n => n.slice(0, -1)));
                const wrongNotePlayed = [...newNoteNames].some(detected => !targetNoteNames.has(detected));
                
                if (wrongNotePlayed) {
                    handleIncorrect();
                }
                setLastSeenNotes(detectedNotes);
            }
        } else if (!isListening && lastSeenNotes.length > 0) {
            setLastSeenNotes([]);
        }
    }, [detectedNotes, isListening, lesson, lastSeenNotes, handleCorrect, handleIncorrect]);


    const handleFactModalClose = () => {
        playClick();
        setShowFact(false);
        onComplete(true);
    };

    const renderLessonContent = () => {
        const currentItem = Array.isArray(lessonContent) ? lessonContent[currentIndex] : lessonContent;
        
        switch (lesson.type) {
            case 'note_identification':
            case 'boss':
            case 'song':
                return (
                    <>
                        {songName && <p className="text-xl text-center text-slate-400 mb-2">Playing: {songName}</p>}
                        <p className="text-2xl text-center text-slate-300 mb-6">Play the next note: <span className="font-bold text-green-400">{currentItem}</span></p>
                        <Staff note={currentItem} />
                        <PianoKeyboard 
                            onNotePress={(note) => {
                                if (note === currentItem) {
                                    handleCorrect();
                                } else {
                                    handleIncorrect();
                                }
                            }}
                            highlightedNote={isCorrect !== null ? currentItem : undefined}
                            correctNote={isCorrect === true ? currentItem : undefined}
                            incorrectNote={isCorrect === false ? currentItem : undefined}
                            clueNotes={showClue ? [currentItem] : undefined}
                        />
                    </>
                );
            case 'quiz':
                const question: QuizQuestion = currentItem;
                return (
                     <>
                        <p className="text-2xl text-center text-slate-300 mb-6">{question.question}</p>
                        <MultipleChoice 
                            options={question.options}
                            onSelect={(selection) => {
                                if (selection === question.correctAnswer) {
                                    handleCorrect();
                                } else {
                                    handleIncorrect();
                                }
                            }}
                            clueAnswer={showClue ? question.correctAnswer : undefined}
                        />
                    </>
                );
            case 'chord_identification':
                const targetChordNotes = currentItem.notes as string[];
                const targetNoteNames = targetChordNotes.map(n => n.slice(0, -1));
                const detectedNoteNames = new Set(detectedNotes.map(n => n.slice(0, -1)));
                return (
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-2xl text-slate-300 mb-2">Play the <span className="font-bold text-green-400">{currentItem.name}</span> chord.</p>
                        
                        <div className="flex space-x-2 mb-6">
                            {targetNoteNames.map(note => (
                                <span key={note} className={`px-3 py-1 rounded-md text-lg font-bold transition-colors ${detectedNoteNames.has(note) ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {note}
                                </span>
                            ))}
                        </div>
                        
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <button
                            onClick={() => {
                                playClick();
                                isListening ? stopListening() : startListening();
                            }}
                            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                            }`}
                        >
                            <span className="text-6xl">🎤</span>
                        </button>
                        <p className="mt-4 text-slate-400 text-lg font-bold">{isListening ? 'Listening...' : 'Tap to Listen'}</p>
                        
                        {showClue && (
                            <div className="mt-6 w-full">
                                <p className="text-center text-green-300 font-semibold mb-2">Hint: Play these notes!</p>
                                <PianoKeyboard
                                    onNotePress={() => {}}
                                    clueNotes={currentItem.notes}
                                />
                            </div>
                        )}
                    </div>
                );
            default:
                return <p>Lesson type not implemented yet.</p>;
        }
    };
    
    return (
        <div className="flex flex-col h-full text-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => { playClick(); onComplete(false); }} className="text-slate-400 hover:text-white">
                    <span className="text-3xl">❌</span>
                </button>
                <div className="w-full bg-slate-700 rounded-full h-4 mx-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <div className="w-8 h-8" /> 
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
                {isComplete ? (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-yellow-400 mb-2">Lesson Complete!</h2>
                        <p className="text-lg text-slate-300">+{lesson.xp} XP, +{lesson.tokens} Tokens</p>
                    </div>
                ) : renderLessonContent()}
            </div>
            
            {/* Footer feedback */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 text-center text-white font-bold text-2xl transition-transform duration-300 ease-in-out ${isCorrect !== null ? 'translate-y-0' : 'translate-y-full'}`}
                 style={{ maxWidth: '24rem', margin: '0 auto' }}>
                <div className={`${isCorrect ? 'bg-green-600' : 'bg-red-600'} p-4 rounded-t-2xl`}>
                    {isCorrect ? 'Correct!' : 'Try again!'}
                </div>
            </div>

            {showFact && lesson.fact && (
                <FactModal fact={lesson.fact} onClose={handleFactModalClose} />
            )}
        </div>
    );
};

export default LessonScreen;