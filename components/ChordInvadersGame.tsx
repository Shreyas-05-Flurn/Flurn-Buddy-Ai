import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePitchDetection } from '../audio/usePitchDetection';

// Game constants
const GAME_CHORDS = [
    { name: 'C Major', notes: ['C4', 'E4', 'G4'] },
    { name: 'G Major', notes: ['G4', 'B4', 'D5'] },
    { name: 'F Major', notes: ['F4', 'A4', 'C5'] },
    { name: 'A Minor', notes: ['A4', 'C5', 'E5'] },
];
const INVADER_START_Y = -10;
const INVADER_END_Y = 100;
const INITIAL_SPEED = 0.1;
const MAX_LIVES = 3;

interface Invader {
    id: number;
    chord: typeof GAME_CHORDS[0];
    y: number;
}

interface ChordInvadersGameProps {
    onExit: () => void;
}

// Simple array comparison function (ignores order)
const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
};

const ChordInvadersGame: React.FC<ChordInvadersGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [invaders, setInvaders] = useState<Invader[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    
    const { detectedNotes, isListening, startListening, stopListening, error } = usePitchDetection();

    // FIX: Initialize useRef with null to provide a required initial value.
    const gameLoopRef = useRef<number | null>(null);
    const lastInvaderId = useRef(0);
    const lastSpawnTime = useRef(0);

    const spawnInvader = useCallback(() => {
        const randomChord = GAME_CHORDS[Math.floor(Math.random() * GAME_CHORDS.length)];
        const newInvader: Invader = {
            id: lastInvaderId.current++,
            chord: randomChord,
            y: INVADER_START_Y,
        };
        setInvaders(prev => [...prev, newInvader]);
    }, []);
    
    const gameLoop = useCallback((timestamp: number) => {
        setInvaders(prev =>
            prev.map(invader => ({ ...invader, y: invader.y + speed }))
                .filter(invader => {
                    if (invader.y > INVADER_END_Y) {
                        setLives(l => l - 1);
                        return false;
                    }
                    return true;
                })
        );
        
        if (timestamp - lastSpawnTime.current > 4000 / (speed / INITIAL_SPEED)) {
            spawnInvader();
            lastSpawnTime.current = timestamp;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [speed, spawnInvader]);

    const startGame = () => {
        setScore(0);
        setLives(MAX_LIVES);
        setInvaders([]);
        setSpeed(INITIAL_SPEED);
        setGameState('playing');
        startListening();
    };

    const stopGame = useCallback(() => {
        setGameState('over');
        stopListening();
         if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }, [stopListening]);

    useEffect(() => {
        if (gameState === 'playing') {
            lastSpawnTime.current = performance.now();
            spawnInvader();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, gameLoop, spawnInvader]);
    
    useEffect(() => {
        if (lives <= 0) {
            stopGame();
        }
    }, [lives, stopGame]);

    useEffect(() => {
        if (gameState !== 'playing' || detectedNotes.length === 0) return;

        const invaderToDestroy = invaders.find(invader => {
            const chordNoteNames = invader.chord.notes.map(n => n.slice(0, -1));
            const detectedNoteNames = detectedNotes.map(n => n.slice(0, -1));
            return arraysEqual(chordNoteNames, detectedNoteNames);
        });

        if (invaderToDestroy) {
            setInvaders(prev => prev.filter(inv => inv.id !== invaderToDestroy.id));
            setScore(s => s + 25);
            if (score > 0 && (score + 25) % 250 === 0) setSpeed(s => s + 0.02);
        }

    }, [detectedNotes, gameState, invaders, score]);


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
                    <p className="text-lg text-slate-300 mb-6">Play chords to destroy the falling invaders. Enable your microphone!</p>
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <button onClick={startGame} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Start Game</button>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="p-4 flex flex-col h-full">
            <div className="w-full flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">&larr; Back to Hub</button>
                <h2 className="text-2xl font-bold text-purple-400">Chord Invaders</h2>
                <div className="w-24 text-right">
                    <span className="font-bold text-lg">❤️ {lives}</span>
                </div>
            </div>
            
            <div className="relative flex-1 bg-slate-800 rounded-lg overflow-hidden">
                {invaders.map(invader => (
                    <div key={invader.id} className="absolute text-center" style={{ top: `${invader.y}%`, left: '50%', transform: 'translateX(-50%)' }}>
                        <span className="text-4xl">👾</span>
                        <p className="text-white font-bold bg-black/50 px-2 rounded">{invader.chord.name}</p>
                    </div>
                ))}
            </div>
             <p className="text-center font-bold text-2xl text-yellow-400 my-4">Score: {score}</p>
             <div className="text-center text-sm text-slate-400 h-6">
                 {isListening ? `Listening... Detected: ${detectedNotes.join(', ')}` : 'Microphone Off'}
             </div>

             {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                    {renderGameState()}
                </div>
            )}
        </div>
    );
};

export default ChordInvadersGame;