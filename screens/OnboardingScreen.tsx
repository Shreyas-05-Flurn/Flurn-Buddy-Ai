import React, { useState, useEffect, useRef } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { useSoundEffects } from '../audio/useSoundEffects';
import { SELECTABLE_AVATARS } from '../constants';
import { audioService } from '../audio/AudioService';
import { ONBOARDING_AUDIO_MP3_BASE64 } from '../audio/onboardingAudio';
import { decode } from '../utils/audioUtils';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const { completeOnboarding } = useUserProgress();
    const { playClick, playSuccess } = useSoundEffects();
    const [step, setStep] = useState(1);
    const [tempNickname, setTempNickname] = useState('New Pianist');
    const [tempAvatar, setTempAvatar] = useState('🎹');
    const [isStoryReady, setIsStoryReady] = useState(false);
    const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
    
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const storyText = "This is Buddy. His world has lost its music! Help him bring it back by completing lessons and restoring harmony.";

    const playAudio = () => {
        const context = audioService.audioContext;
        if (!audioBufferRef.current || !context || audioSourceRef.current) return;
        
        // Final check before playing
        if (context.state === 'running') {
            const source = context.createBufferSource();
            audioSourceRef.current = source;
            source.buffer = audioBufferRef.current;
            source.connect(context.destination);
            source.start();

            source.onended = () => {
                audioSourceRef.current = null;
            };
        } else {
             // If context is still not running, show the prompt (fallback for auto-login)
            setIsAutoplayBlocked(true);
        }
    };

    const handleUserInteraction = async () => {
        if (isAutoplayBlocked) {
            await audioService.resumeContext();
            playAudio();
            setIsAutoplayBlocked(false);
        }
    };

    // Effect to set up and play audio, handling autoplay policies
    useEffect(() => {
        const setupAndPlayAudio = async () => {
            try {
                const context = audioService.audioContext;
                if (!context) {
                    setIsStoryReady(true);
                    return;
                }
                
                // NEW METHOD: Directly decode the base64 string, bypassing fetch()
                const decodedData = decode(ONBOARDING_AUDIO_MP3_BASE64);
                const arrayBuffer = decodedData.buffer; // Use the underlying ArrayBuffer
                const buffer = await context.decodeAudioData(arrayBuffer);
                
                audioBufferRef.current = buffer;
                
                setIsStoryReady(true);
                playAudio(); // Attempt to play immediately

            } catch (error) {
                console.error("Audio Setup Error:", error);
                setIsStoryReady(true); // Ensure UI is not blocked on audio error
            }
        };

        setupAndPlayAudio();

        return () => {
            // Stop any playing audio when the component unmounts
            if (audioSourceRef.current) {
                try {
                    audioSourceRef.current.stop();
                } catch(e) {
                    // This can throw an error if the source has already finished.
                }
            }
            // Do NOT close the global audio context here as it's shared.
        };
    }, []);

    const handleProfileSubmit = () => {
        if (tempNickname.trim()) {
            playSuccess();
            completeOnboarding(tempNickname.trim(), tempAvatar);
            onComplete();
        }
    };

    const renderStepOne = () => (
        <>
            <div className="text-green-400 mb-6">
                <span className="text-8xl">🎶</span>
            </div>
            <div className="text-center w-full mb-12">
                <h1 className="text-4xl font-extrabold text-white mb-4 mx-auto">Welcome to Flurn Buddy!</h1>
                <div className="relative inline-block max-w-md">
                    <p className={`text-slate-300 text-lg transition-opacity duration-300 ${isStoryReady ? 'opacity-100' : 'opacity-0'}`}>
                        {storyText}
                    </p>
                </div>
            </div>
            <button
                onClick={() => { playClick(); setStep(2); }}
                className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
                Let's help!
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
        <div 
            className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900"
            onClick={isAutoplayBlocked ? handleUserInteraction : undefined}
        >
            {isAutoplayBlocked && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 animate-pulse">
                    <p className="text-2xl font-bold text-white">Tap anywhere to begin</p>
                </div>
            )}
            {step === 1 ? renderStepOne() : renderStepTwo()}
        </div>
    );
};

export default OnboardingScreen;