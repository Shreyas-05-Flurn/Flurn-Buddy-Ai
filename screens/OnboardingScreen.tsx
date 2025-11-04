import React, { useState } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { useSoundEffects } from '../audio/useSoundEffects';
import { SELECTABLE_AVATARS } from '../constants';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { progress, completeOnboarding, updateProfile } = useUserProgress();
    const { playClick, playSuccess } = useSoundEffects();
    const [step, setStep] = useState(1);
    const [tempNickname, setTempNickname] = useState(progress.nickname);
    const [tempAvatar, setTempAvatar] = useState(progress.avatar);

    const handleProfileSubmit = () => {
        if (tempNickname.trim()) {
            playSuccess();
            updateProfile(tempNickname.trim(), tempAvatar);
            completeOnboarding();
            onComplete();
        }
    };

    const renderStepOne = () => (
        <>
            <div className="text-green-400 mb-6">
                <span className="text-8xl">🎶</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to Flurn Buddy!</h1>
            <p className="text-slate-300 text-lg mb-12">
                This is Buddy. His world has lost its music! Help him bring it back by completing lessons and restoring harmony.
            </p>
            <button
                onClick={() => { playClick(); setStep(2); }}
                className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Continue
            </button>
        </>
    );

    const renderStepTwo = () => (
        <>
            <h1 className="text-3xl font-extrabold text-white mb-6">Create Your Profile</h1>
            
            <label className="text-sm font-bold text-slate-400 self-start">Nickname</label>
            <input 
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 mb-4"
                maxLength={20}
            />

            <label className="text-sm font-bold text-slate-400 self-start block">Avatar</label>
            <div className="grid grid-cols-6 gap-2 mt-2 bg-slate-900/50 p-3 rounded-lg w-full mb-8">
                {SELECTABLE_AVATARS.map(avatar => (
                    <button
                        key={avatar}
                        onClick={() => { playClick(); setTempAvatar(avatar); }}
                        className={`text-3xl rounded-lg p-1 transition-all ${tempAvatar === avatar ? 'bg-green-500 ring-2 ring-white' : 'hover:bg-slate-700'}`}
                    >
                        {avatar}
                    </button>
                ))}
            </div>

            <button
                onClick={handleProfileSubmit}
                disabled={!tempNickname.trim()}
                className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 disabled:bg-slate-600 disabled:shadow-none disabled:transform-none transition-all duration-300 ease-in-out"
            >
                Start Learning!
            </button>
        </>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
            {step === 1 ? renderStepOne() : renderStepTwo()}
        </div>
    );
};

export default OnboardingScreen;
