import React, { useState } from 'react';

interface PracticeWeaverProps {
    onExit: () => void;
}

const PracticeWeaver: React.FC<PracticeWeaverProps> = ({ onExit }) => {
    const [lesson, setLesson] = useState<string | null>(null);

    const generateLesson = () => {
        const weaknesses = [
            "the transition between G Major and C Major chords",
            "the timing of quarter notes in a fast tempo",
            "identifying the note 'B4' by ear",
            "playing sharps and flats accurately"
        ];
        const exercises = [
            "Let's do a quick drill focusing on switching between G and C chords!",
            "I've made a special rhythm challenge to help with your timing!",
            "Time for a 2-minute ear training session on B4 and its neighbors!",
            "Let's practice a scale that uses F# and C# to build muscle memory!"
        ];

        const randomIndex = Math.floor(Math.random() * weaknesses.length);
        const generatedText = `Buddy noticed you're doing great, but could use a little practice on **${weaknesses[randomIndex]}**. ${exercises[randomIndex]}`;
        
        setLesson(generatedText);
    };

    return (
        <div className="p-6 flex flex-col items-center h-full text-center">
            <div className="w-full flex justify-between items-center mb-6">
                 <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">
                    &larr; Back to Buddy Hub
                </button>
                <h2 className="text-2xl font-bold text-amber-400">Practice Weaver</h2>
                <div className="w-24"></div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                {lesson ? (
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <p className="text-lg text-slate-300" dangerouslySetInnerHTML={{ __html: lesson.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-400">$1</strong>') }} />
                        <button onClick={generateLesson} className="mt-6 bg-green-500 text-white font-bold py-2 px-5 rounded-lg">
                            Give Me Another!
                        </button>
                    </div>
                ) : (
                     <>
                        <p className="text-lg text-slate-300 mb-6">Buddy can analyze your recent lessons and create a short, personalized practice session to target your weaknesses.</p>
                        <button onClick={generateLesson} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                            Weave My Practice!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PracticeWeaver;