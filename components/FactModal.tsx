import React from 'react';

interface FactModalProps {
    fact: string;
    onClose: () => void;
}

const FactModal: React.FC<FactModalProps> = ({ fact, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl p-6 border-2 border-green-500 shadow-2xl shadow-green-500/10 w-full max-w-sm text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-green-400 mb-2">🎶 Did you know?</h3>
                <p className="text-slate-300 text-lg mb-6">{fact}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-green-600 transition-colors"
                >
                    Cool!
                </button>
            </div>
        </div>
    );
};

export default FactModal;