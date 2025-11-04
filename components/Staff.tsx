import React from 'react';

interface StaffProps {
    note: string; // e.g., 'C4', 'G4'
    noteX?: number; // As a percentage from the left
}

// NOTE: Positions are adjusted slightly to center the new note icon vertically.
const NOTE_POSITIONS: { [key: string]: number } = {
    'C4': 68,
    'D4': 60.5,
    'E4': 53,
    'F4': 45.5,
    'G4': 38,
    'A4': 30.5,
    'B4': 23,
    'C5': 15.5,
    'D5': 8,
    'E5': 0.5,
};

const Staff: React.FC<StaffProps> = ({ note, noteX = 50 }) => {
    const noteY = NOTE_POSITIONS[note] || 0;
    const noteLetter = note.slice(0, 1);

    return (
        <div className="relative w-full max-w-xs h-32 mb-8">
            {/* Staff lines */}
            {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-full h-0.5 bg-slate-400" style={{ top: `${20 + i * 16}%` }}></div>
            ))}
            
            {/* Treble Clef */}
            <svg className="absolute -left-4 top-1/2 -translate-y-1/2 h-28 w-auto text-slate-300" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M129.5 241.5C148 212 165 204 165 174C165 142.5 145 122.5 120.5 122.5C92.5 122.5 70 148 70 181.5C70 209 82.5 229.5 100.5 241.5C118.5 253.5 122.5 264.5 122.5 277.5V360.5C122.5 380 114 388.5 100.5 388.5C85.5 388.5 77.5 379 77.5 360.5" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M100.5 121C117 101.5 137.5 83.5 165 83.5" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
                <circle cx="122" cy="198" r="10" fill="currentColor"/>
            </svg>

            {/* Note */}
            {noteY !== undefined && (
                 <div 
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-green-400 rounded-full border-2 border-slate-900 shadow-lg" 
                    style={{ top: `${noteY}%`, left: `${noteX}%` }}
                 >
                    <span className="text-2xl font-bold text-slate-900">{noteLetter}</span>
                </div>
            )}

             {/* Ledger line for C4 */}
             {note === 'C4' && (
                <div 
                    className="absolute w-12 h-0.5 bg-slate-400 -translate-y-1/2" 
                    style={{ top: `${NOTE_POSITIONS['C4']}%`, left: `${noteX}%`, transform: `translateX(-50%)` }}>
                </div>
             )}
        </div>
    );
};

export default Staff;