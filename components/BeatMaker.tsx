import React, { useState, useEffect, useRef } from 'react';
import { BeatTrack } from '../types';
import { audioService } from '../audio/AudioService';

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
    const [currentStep, setCurrentStep] = useState(-1);

    const tracksRef = useRef(tracks);
    tracksRef.current = tracks;

    const intervalRef = useRef<number | null>(null);
    const stepTime = 125; // 120 BPM, 16th notes

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const toggleStep = (trackIndex: number, stepIndex: number) => {
        setTracks(prevTracks => {
            const newTracks = JSON.parse(JSON.stringify(prevTracks));
            newTracks[trackIndex].steps[stepIndex].isActive = !newTracks[trackIndex].steps[stepIndex].isActive;
            return newTracks;
        });
    };

    const runSequence = () => {
        setCurrentStep(prevStep => {
            const nextStep = (prevStep + 1) % NUM_STEPS;
            const currentTracks = tracksRef.current;
            const notesToPlay: string[] = [];
            currentTracks.forEach(track => {
                if (track.steps[nextStep].isActive) {
                    notesToPlay.push(track.steps[nextStep].note);
                }
            });
            if (notesToPlay.length > 0) {
                audioService.playNotes(notesToPlay);
            }
            return nextStep;
        });
    };

    const togglePlay = () => {
        audioService.resumeContext();
        if (isPlaying) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setCurrentStep(-1);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            setCurrentStep(-1);
            runSequence();
            intervalRef.current = window.setInterval(runSequence, stepTime);
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