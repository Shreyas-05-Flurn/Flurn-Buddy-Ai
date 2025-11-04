import React from 'react';

interface MultipleChoiceProps {
    options: string[];
    onSelect: (selection: string) => void;
    clueAnswer?: string;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ options, onSelect, clueAnswer }) => {
    return (
        <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-xs">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`p-4 bg-slate-700 text-white font-bold text-2xl rounded-lg border-2 border-slate-600 hover:bg-green-500 hover:border-green-500 transition-all
                        ${option === clueAnswer ? 'ring-2 ring-green-500 animate-pulse' : ''}`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export default MultipleChoice;