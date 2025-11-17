import { useCallback } from 'react';
import { audioService } from './AudioService';

const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(50); // A short, subtle vibration
    }
};

export const useSoundEffects = () => {
    const playSound = useCallback((action: 'click' | 'success' | 'error') => {
        audioService.resumeContext();

        try {
            switch (action) {
                case 'click':
                    audioService.playNotes('C5');
                    break;
                case 'success':
                    audioService.playNotes(['C5', 'E5', 'G5']);
                    break;
                case 'error':
                    audioService.playNotes(['C4', 'C#4']);
                    break;
            }
        } catch (e) {
            console.error("AudioService error:", e)
        }
        
        triggerHaptic();
    }, []);

    const playClick = useCallback(() => playSound('click'), [playSound]);
    const playSuccess = useCallback(() => playSound('success'), [playSound]);
    const playError = useCallback(() => playSound('error'), [playSound]);

    return { playClick, playSuccess, playError };
};
