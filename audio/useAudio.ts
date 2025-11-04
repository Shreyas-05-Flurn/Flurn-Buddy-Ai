import { useRef, useEffect } from 'react';

declare const Tone: any;

let synth: any = null;

export const useAudio = () => {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && typeof Tone !== 'undefined') {
            synth = new Tone.Synth().toDestination();
            isInitialized.current = true;
        }
    }, []);

    const playNote = (note: string) => {
        if (synth && Tone.context.state !== 'running') {
            Tone.start();
        }
        if (synth) {
            synth.triggerAttackRelease(note, "8n");
        }
    };

    return { playNote };
};
