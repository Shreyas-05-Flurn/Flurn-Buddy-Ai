import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MagicKeysGameProps {
    onExit: () => void;
}

// Game constants
const NOTES_TO_PRACTICE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
const NOTE_LANES: { [key: string]: number } = { // % position from left
    'C4': 10, 'D4': 22, 'E4': 34, 'F4': 46, 'G4': 58, 'A4': 70, 'B4': 82,
};
const NOTE_START_Y = -10;
const NOTE_END_Y = 110;
const PLAY_ZONE_Y = 85;
const INITIAL_SPEED = 0.2;

interface FallingNote {
    id: number;
    name: string;
    y: number;
    lane: number;
}

const MagicKeysGame: React.FC<MagicKeysGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [notes, setNotes] = useState<FallingNote[]>([]);
    const [score, setScore] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const gameLoopRef = useRef<number | null>(null);
    const lastNoteId = useRef(0);
    const lastSpawnTime = useRef(0);

    const spawnNote = useCallback(() => {
        const randomNoteName = NOTES_TO_PRACTICE[Math.floor(Math.random() * NOTES_TO_PRACTICE.length)];
        const newNote: FallingNote = {
            id: lastNoteId.current++,
            name: randomNoteName,
            y: NOTE_START_Y,
            lane: NOTE_LANES[randomNoteName],
        };
        setNotes(prev => [...prev, newNote]);
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        setNotes(prev =>
            prev.map(note => ({ ...note, y: note.y + INITIAL_SPEED }))
                .filter(note => note.y < NOTE_END_Y)
        );

        if (timestamp - lastSpawnTime.current > 1500) {
            spawnNote();
            lastSpawnTime.current = timestamp;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [spawnNote]);

    const startGame = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setScore(0);
            setNotes([]);
            setGameState('playing');
        } catch (err) {
            console.error("Magic Keys camera error:", err);
            setError("Could not access camera. Please check permissions and ensure no other app is using it.");
        }
    };
    
    useEffect(() => {
        if (gameState === 'playing') {
            lastSpawnTime.current = performance.now();
            spawnNote();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [gameState, gameLoop, spawnNote, stream]);


    return (
        <div className="p-4 flex flex-col h-full bg-slate-900">
            <div className="w-full flex justify-between items-center mb-4 z-20">
                <button onClick={onExit} className="text-white font-bold bg-black/50 px-3 py-1 rounded-lg">&larr; Back to Hub</button>
                <h2 className="text-2xl font-bold text-teal-400 bg-black/50 px-3 py-1 rounded-lg">Magic Keys</h2>
                <div className="font-bold text-lg text-yellow-400 bg-black/50 px-3 py-1 rounded-lg">Score: {score}</div>
            </div>

            <div className="relative flex-1 w-full bg-slate-800 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover"></video>
                
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <div className="text-center p-4">
                            <p className="text-lg text-slate-300 mb-6">Point your camera at your keyboard and play the falling notes!</p>
                            {error && <p className="text-red-400 mb-4">{error}</p>}
                            <button onClick={startGame} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Start Game</button>
                        </div>
                    </div>
                )}

                {/* Game Overlay */}
                <div className="absolute inset-0 z-10">
                    {/* Play Zone Line */}
                    <div className="absolute w-full h-1 bg-green-400/80 shadow-lg shadow-green-400" style={{ top: `${PLAY_ZONE_Y}%` }}></div>
                    
                    {/* Falling Notes */}
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className="absolute -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-sky-400 rounded-full border-2 border-white shadow-lg"
                            style={{ top: `${note.y}%`, left: `${note.lane}%` }}
                        >
                            <span className="text-xl font-bold text-slate-900">{note.name.slice(0, -1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MagicKeysGame;