import React, { useState, useEffect, useRef, useCallback } from 'react';
import Staff from './Staff';
import PianoKeyboard from './PianoKeyboard';

// Game constants
const NOTES_TO_PRACTICE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
const NOTE_START_X = 110; // Start off-screen to the right
const NOTE_END_X = -10;   // End off-screen to the left
const PLAY_ZONE_START = 15; // Hit zone starts at 15% from left
const PLAY_ZONE_END = 25;   // Hit zone ends at 25% from left
const INITIAL_SPEED = 0.2;
const MAX_LIVES = 3;

interface NoteOnScreen {
    id: number;
    name: string;
    x: number;
}

interface SightReadingGameProps {
    onExit: () => void;
}

const SightReadingGame: React.FC<SightReadingGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [notes, setNotes] = useState<NoteOnScreen[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [speed, setSpeed] = useState(INITIAL_SPEED);

    // FIX: Initialize useRef with null to provide a required initial value.
    const gameLoopRef = useRef<number | null>(null);
    const lastNoteId = useRef(0);
    const lastSpawnTime = useRef(0);

    const spawnNote = useCallback(() => {
        const randomNote = NOTES_TO_PRACTICE[Math.floor(Math.random() * NOTES_TO_PRACTICE.length)];
        const newNote: NoteOnScreen = {
            id: lastNoteId.current++,
            name: randomNote,
            x: NOTE_START_X,
        };
        setNotes(prev => [...prev, newNote]);
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        setNotes(prev =>
            prev.map(note => ({ ...note, x: note.x - speed }))
                .filter(note => {
                    if (note.x < NOTE_END_X) {
                        setLives(l => l - 1); // Note missed
                        return false;
                    }
                    return true;
                })
        );

        if (timestamp - lastSpawnTime.current > 2000 / (speed / INITIAL_SPEED)) {
            spawnNote();
            lastSpawnTime.current = timestamp;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [speed, spawnNote]);

    useEffect(() => {
        if (gameState === 'playing') {
            lastSpawnTime.current = performance.now();
            spawnNote();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, gameLoop, spawnNote]);

    useEffect(() => {
        if (lives <= 0) {
            setGameState('over');
        }
    }, [lives]);

    const handleNotePress = (noteName: string) => {
        if (gameState !== 'playing') return;

        const hittableNotes = notes.filter(n => n.x >= PLAY_ZONE_START && n.x <= PLAY_ZONE_END);
        const correctNote = hittableNotes.find(n => n.name === noteName);

        if (correctNote) {
            setScore(s => s + 10);
            setNotes(prev => prev.filter(n => n.id !== correctNote.id));
            if (score > 0 && (score + 10) % 100 === 0) setSpeed(s => s + 0.05); // Increase speed
        } else if (hittableNotes.length > 0) {
            setLives(l => l - 1); // Wrong note in zone
        }
    };

    const startGame = () => {
        setScore(0);
        setLives(MAX_LIVES);
        setNotes([]);
        setSpeed(INITIAL_SPEED);
        setGameState('playing');
    };

    const renderGameState = () => {
        if (gameState === 'over') {
            return (
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-red-500">Game Over</h3>
                    <p className="text-xl text-white mt-2">Final Score: {score}</p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button onClick={startGame} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Play Again</button>
                        <button onClick={onExit} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg">Exit</button>
                    </div>
                </div>
            );
        }

        if (gameState === 'idle') {
            return (
                <div className="text-center">
                    <p className="text-lg text-slate-300 mb-6">Play the notes as they pass through the green zone. Don't miss!</p>
                    <button onClick={startGame} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Start Game</button>
                </div>
            );
        }

        return null; // Playing state is handled by the main render
    };

    return (
        <div className="p-4 flex flex-col items-center h-full">
            <div className="w-full flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">&larr; Back to Hub</button>
                <h2 className="text-2xl font-bold text-rose-400">Sight-Reading Rush</h2>
                <div className="w-24 text-right">
                    <span className="font-bold text-lg">❤️ {lives}</span>
                </div>
            </div>

            <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden">
                {/* Play Zone */}
                <div className="absolute h-full bg-green-500/20 z-0" style={{ left: `${PLAY_ZONE_START}%`, width: `${PLAY_ZONE_END - PLAY_ZONE_START}%` }}></div>
                {/* Staff inside */}
                <div className="absolute inset-0">
                    {notes.map(note => <Staff key={note.id} note={note.name} noteX={note.x} />)}
                </div>
            </div>
            <p className="text-center font-bold text-2xl text-yellow-400 my-4">Score: {score}</p>

            {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                    {renderGameState()}
                </div>
            )}
            
            <PianoKeyboard onNotePress={handleNotePress} />
        </div>
    );
};

export default SightReadingGame;