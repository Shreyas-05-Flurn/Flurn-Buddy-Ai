import { useCallback } from 'react';

declare const Tone: any;

let synth: any;
let isInitialized = false;

const initializeAudio = () => {
    if (!isInitialized && typeof Tone !== 'undefined') {
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 },
        }).toDestination();
        isInitialized = true;
    }
};

const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(50); // A short, subtle vibration
    }
};

export const useSoundEffects = () => {
    const playSound = useCallback((action: 'click' | 'success' | 'error') => {
        if (typeof Tone === 'undefined') return;
        
        if (Tone.context.state !== 'running') {
            Tone.start();
        }
        
        initializeAudio();
        
        if (!synth) return;

        try {
            switch (action) {
                case 'click':
                    synth.triggerAttackRelease('C5', '16n');
                    break;
                case 'success':
                    synth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
                    break;
                case 'error':
                    synth.triggerAttackRelease(['C4', 'C#4'], '8n');
                    break;
            }
        } catch (e) {
            console.error("Tone.js error:", e)
        }
        
        triggerHaptic();
    }, []);

    const playClick = useCallback(() => playSound('click'), [playSound]);
    const playSuccess = useCallback(() => playSound('success'), [playSound]);
    const playError = useCallback(() => playSound('error'), [playSound]);

    return { playClick, playSuccess, playError };
};
