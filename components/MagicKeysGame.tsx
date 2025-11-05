import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { PianoKeyPosition } from '../types';

interface MagicKeysGameProps {
    onExit: () => void;
}

// Schema for Gemini API to ensure structured JSON response
const keySchema = {
    type: Type.OBJECT,
    properties: {
        keys: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    noteName: { type: Type.STRING, description: "The note name, e.g., 'C4', 'F#5'" },
                    boundingBox: {
                        type: Type.OBJECT,
                        properties: {
                            x_min: { type: Type.NUMBER },
                            y_min: { type: Type.NUMBER },
                            x_max: { type: Type.NUMBER },
                            y_max: { type: Type.NUMBER },
                        },
                        required: ['x_min', 'y_min', 'x_max', 'y_max']
                    }
                },
                required: ['noteName', 'boundingBox']
            }
        }
    },
    required: ['keys']
};

const MagicKeysGame: React.FC<MagicKeysGameProps> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'idle' | 'starting_camera' | 'ready_to_scan' | 'scanning' | 'playing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [locatedKeys, setLocatedKeys] = useState<PianoKeyPosition[]>([]);
    const [noteSequence, setNoteSequence] = useState<string[]>([]);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
    const [score, setScore] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoWrapperRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        setGameState('starting_camera');
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setGameState('ready_to_scan');
        } catch (err) {
            console.error("Magic Keys camera error:", err);
            setError("Could not access camera. Please check permissions.");
            setGameState('error');
        }
    }, []);

    const handleScanKeys = useCallback(async () => {
        setGameState('scanning');
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < video.HAVE_METADATA) {
            setError("Camera not ready. Please try again.");
            setGameState('error');
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageData = canvas.toDataURL('image/jpeg');
        const base64Data = imageData.split(',')[1];

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [
                    { text: "Identify all the white piano keys visible in the image. Return a JSON object containing a 'keys' array. Each object in the array should have a 'noteName' (e.g., 'F4', 'G4') and a 'boundingBox' with normalized x_min, y_min, x_max, y_max coordinates. Start from the lowest note you can see and move upwards." },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
                ]},
                config: {
                    responseMimeType: "application/json",
                    responseSchema: keySchema
                }
            });

            const result = JSON.parse(response.text);
            if (!result.keys || result.keys.length < 3) {
                 setError("Could not identify enough keys. Try a clearer, more direct view of the keyboard.");
                 setGameState('ready_to_scan');
                 return;
            }
            
            setLocatedKeys(result.keys);
            const keyNames = result.keys.map((k: PianoKeyPosition) => k.noteName);
            setNoteSequence(keyNames);
            setCurrentNoteIndex(0);
            setScore(0);
            setGameState('playing');

        } catch (e) {
            console.error("Gemini API Error:", e);
            setError("Could not analyze the image. Please try again.");
            setGameState('ready_to_scan');
        }
    }, []);

    const handleNextNote = () => {
        setScore(prev => prev + 10);
        setCurrentNoteIndex(prev => (prev + 1) % noteSequence.length);
    };

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const renderOverlayContent = () => {
        switch (gameState) {
            case 'idle':
                return (
                    <div className="text-center p-4">
                        <p className="text-lg text-slate-300 mb-6">Point your camera at a piano. Get a clear, well-lit view of the keys.</p>
                        <button onClick={startCamera} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Start Camera</button>
                    </div>
                );
            case 'starting_camera':
            case 'scanning':
                return (
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-t-green-400 border-slate-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-semibold text-white">{gameState === 'scanning' ? 'Scanning Keys...' : 'Starting Camera...'}</p>
                    </div>
                );
            case 'ready_to_scan':
                return (
                    <div className="text-center p-4">
                        <p className="text-lg text-slate-300 mb-6">Position your keyboard in the frame and hold steady.</p>
                        <button onClick={handleScanKeys} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg">Scan Keys</button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-4">
                        <p className="text-lg text-red-400 mb-6">{error}</p>
                        <button onClick={startCamera} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">Try Again</button>
                    </div>
                );
            default: return null;
        }
    };
    
    const currentNoteToPlay = gameState === 'playing' ? noteSequence[currentNoteIndex] : null;
    const keyPosition = currentNoteToPlay ? locatedKeys.find(k => k.noteName === currentNoteToPlay) : null;
    const videoWrapperRect = videoWrapperRef.current?.getBoundingClientRect();

    return (
        <div className="p-4 flex flex-col h-full bg-slate-900">
            <div className="w-full flex justify-between items-center mb-4 z-20">
                <button onClick={() => { cleanup(); onExit(); }} className="text-white font-bold bg-black/50 px-3 py-1 rounded-lg">&larr; Back to Hub</button>
                <h2 className="text-2xl font-bold text-teal-400 bg-black/50 px-3 py-1 rounded-lg">Magic Keys</h2>
                <div className="font-bold text-lg text-yellow-400 bg-black/50 px-3 py-1 rounded-lg">Score: {score}</div>
            </div>

            <div ref={videoWrapperRef} className="relative flex-1 w-full bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="absolute w-full h-full object-cover"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                {gameState !== 'playing' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                        {renderOverlayContent()}
                    </div>
                )}
                
                {gameState === 'playing' && keyPosition && videoWrapperRect && (
                    <>
                        <div
                            className="absolute bg-green-500/80 rounded-lg animate-pulse-highlight"
                            style={{
                                left: `${keyPosition.boundingBox.x_min * 100}%`,
                                top: `${keyPosition.boundingBox.y_min * 100}%`,
                                width: `${(keyPosition.boundingBox.x_max - keyPosition.boundingBox.x_min) * 100}%`,
                                height: `${(keyPosition.boundingBox.y_max - keyPosition.boundingBox.y_min) * 100}%`,
                            }}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center space-y-4">
                             <p className="text-2xl font-bold text-white bg-black/60 px-4 py-2 rounded-lg">Play: {currentNoteToPlay}</p>
                             <button onClick={handleNextNote} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">I Played It!</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MagicKeysGame;