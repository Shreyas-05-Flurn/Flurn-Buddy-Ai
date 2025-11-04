import React from 'react';
import { PIANO_KEYS } from '../constants';
import { useAudio } from '../audio/useAudio';

interface PianoKeyboardProps {
    onNotePress: (note: string) => void;
    highlightedNote?: string;
    correctNote?: string;
    incorrectNote?: string;
    clueNotes?: string[];
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ onNotePress, highlightedNote, correctNote, incorrectNote, clueNotes }) => {
    const { playNote } = useAudio();
    
    const handlePress = (note: string) => {
        playNote(note);
        onNotePress(note);
    };
    
    const getKeyClass = (note: string) => {
        if (correctNote === note) return 'bg-green-400';
        if (incorrectNote && highlightedNote === note) return 'bg-red-400';
        if (clueNotes?.includes(note)) return 'bg-white ring-4 ring-green-500 animate-pulse';
        if (highlightedNote === note) return 'bg-green-300';
        return 'bg-white hover:bg-gray-200 active:bg-gray-300';
    };
    
    const getBlackKeyClass = (note: string) => {
        if (correctNote === note) return 'bg-green-600';
        if (incorrectNote && highlightedNote === note) return 'bg-red-600';
        if (clueNotes?.includes(note)) return 'bg-slate-900 ring-4 ring-green-500 animate-pulse';
        if (highlightedNote === note) return 'bg-green-700';
        return 'bg-slate-900 hover:bg-slate-700 active:bg-slate-600';
    }


    const renderWhiteKeys = () => {
        return PIANO_KEYS.white.map((key) => {
            const note = `${key}4`;
            return (
                <div
                    key={key}
                    onClick={() => handlePress(note)}
                    className={`relative w-11 h-48 border-2 border-slate-700 rounded-b-md cursor-pointer
                                transition-colors duration-150 ${getKeyClass(note)}`}
                >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-slate-600">{key}</span>
                </div>
            );
        });
    };

    const renderBlackKeys = () => {
        return PIANO_KEYS.black.map((key, index) => {
            if (key === null) {
                return <div key={`spacer-${index}`} className="w-5 h-32" />;
            }
            const note = `${key}4`;
            return (
                <div
                    key={key}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePress(note);
                    }}
                    className={`absolute w-8 h-32 top-0 -ml-4 border-2 border-slate-800 rounded-b-md z-10 cursor-pointer
                                transition-colors duration-150 ${getBlackKeyClass(note)}`}
                ></div>
            );
        });
    };

    return (
        <div className="flex justify-center p-4">
            <div className="flex relative">
                {renderWhiteKeys()}
                <div className="absolute top-0 left-0 flex h-32 items-start pl-8 pointer-events-none">
                   {React.Children.map(renderBlackKeys(), child => 
                        React.cloneElement(child, { className: `${child.props.className} pointer-events-auto`})
                   )}
                </div>
            </div>
        </div>
    );
};

export default PianoKeyboard;