import React, { useState, useEffect, useRef } from 'react';
import { BeatTrack, BeatStep } from '../types';

declare const Tone: any;

interface BeatMakerProps {
    onExit: () => void;
}

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].reverse();
const NUM_STEPS = 16;

const initialTracks: BeatTrack[] = NOTES.map((note, i) => ({
    id: i,
    steps: Array(NUM_STEPS).fill(0).map(() => ({
        note: note,
        isActive: false,
    })),
}));

const BeatMaker: React.FC<BeatMakerProps> = ({ onExit }) => {
    const [tracks, setTracks] = useState<BeatTrack[]>(initialTracks);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const synth = useRef<any>(null);
    const sequence = useRef<any>(null);

    useEffect(() => {
        // Initialize Tone.js elements
        if (typeof Tone !== 'undefined') {
            synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
        }

        return () => {
            // Cleanup on unmount
            if (sequence.current) {
                sequence.current.stop();
                sequence.current.dispose();
            }
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
                Tone.Transport.cancel();
            }
        };
    }, []);

    const toggleStep = (trackIndex: number, stepIndex: number) => {
        const newTracks = [...tracks];
        newTracks[trackIndex].steps[stepIndex].isActive = !newTracks[trackIndex].steps[stepIndex].isActive;
        setTracks(newTracks);
    };

    const togglePlay = () => {
        if (typeof Tone === 'undefined') return;

        if (Tone.context.state !== 'running') {
            Tone.start();
        }

        if (isPlaying) {
            Tone.Transport.stop();
            setIsPlaying(false);
        } else {
            if (sequence.current) {
                sequence.current.dispose();
            }
            
            sequence.current = new Tone.Sequence((time, step) => {
                const notesToPlay: string[] = [];
                tracks.forEach(track => {
                    if (track.steps[step].isActive) {
                        notesToPlay.push(track.steps[step].note);
                    }
                });
                if (notesToPlay.length > 0) {
                    synth.current.triggerAttackRelease(notesToPlay, '8n', time);
                }
                Tone.Draw.schedule(() => {
                    setCurrentStep(step);
                }, time);
            }, Array.from(Array(NUM_STEPS).keys()), '16n');

            sequence.current.start(0);
            Tone.Transport.start();
            setIsPlaying(true);
        }
    };
    
    return (
        <div className="p-4 flex flex-col h-full">
             <div className="w-full flex justify-between items-center mb-4">
                 <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">
                    &larr; Back to Buddy Hub
                </button>
                <h2 className="text-2xl font-bold text-rose-400">Buddy's Beat Maker</h2>
                <div className="w-24"></div>
            </div>

            <div className="flex-1 grid grid-cols-16 gap-1 p-2 bg-slate-800 rounded-lg overflow-x-auto no-scrollbar">
                {tracks.map((track, trackIndex) => (
                    <React.Fragment key={track.id}>
                        {track.steps.map((step, stepIndex) => (
                            <div
                                key={`${trackIndex}-${stepIndex}`}
                                onClick={() => toggleStep(trackIndex, stepIndex)}
                                className={`w-8 h-8 rounded cursor-pointer transition-colors ${
                                    step.isActive ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'
                                } ${isPlaying && currentStep === stepIndex ? 'ring-2 ring-yellow-400' : ''}`}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex items-center justify-center mt-4">
                <button onClick={togglePlay} className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg">
                    {isPlaying ? 'Stop' : 'Play'}
                </button>
            </div>
        </div>
    );
};

export default BeatMaker;