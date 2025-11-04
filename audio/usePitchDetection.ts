import { useState, useRef, useCallback, useEffect } from 'react';

// C4 is MIDI note 60. A4 is 440 Hz.
const A4_FREQ = 440.0;
const A4_NOTE_NUM = 69;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FFT_SIZE = 8192; // Increased for better frequency resolution for chord detection

const freqToNoteNum = (freq: number): number => {
    return 12 * (Math.log(freq / A4_FREQ) / Math.log(2)) + A4_NOTE_NUM;
};

const noteNumToName = (noteNum: number): string => {
    const roundedNote = Math.round(noteNum);
    const octave = Math.floor(roundedNote / 12) - 1;
    const name = NOTE_NAMES[roundedNote % 12];
    return name + octave;
};


export const usePitchDetection = () => {
    const [isListening, setIsListening] = useState(false);
    const [detectedNotes, setDetectedNotes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const processAudio = useCallback(() => {
        if (!isListening || !analyserRef.current || !audioContextRef.current) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const analyser = analyserRef.current;
        const freqData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(freqData);

        const sampleRate = audioContextRef.current.sampleRate;
        const binWidth = sampleRate / analyser.fftSize;

        const PEAK_THRESHOLD_DB = -50;
        const MIN_FREQ = 60; // C2
        const MAX_FREQ = 1050; // C6

        const peaks = [];
        for (let i = 1; i < freqData.length - 1; i++) {
            const magnitude = freqData[i];
            if (magnitude > PEAK_THRESHOLD_DB && magnitude > freqData[i - 1] && magnitude > freqData[i + 1]) {
                const freq = i * binWidth;
                if (freq >= MIN_FREQ && freq <= MAX_FREQ) {
                    peaks.push({ freq, magnitude });
                }
            }
        }

        if (peaks.length > 0) {
            peaks.sort((a, b) => b.magnitude - a.magnitude);
            
            const fundamentals = [];
            const HARMONIC_TOLERANCE = 0.05; // 5%

            for(const peak of peaks) {
                let isHarmonic = false;
                for(const fundamental of fundamentals) {
                    const ratio = peak.freq / fundamental.freq;
                    const nearestInteger = Math.round(ratio);
                    if (nearestInteger > 1 && Math.abs(ratio - nearestInteger) < HARMONIC_TOLERANCE) {
                        isHarmonic = true;
                        break;
                    }
                }
                if(!isHarmonic) {
                    fundamentals.push(peak);
                }
            }
            
            const detectedNoteNames = new Set<string>();
            for (const fundamental of fundamentals.slice(0, 5)) { // Process up to 5 strongest fundamentals
                const noteNum = freqToNoteNum(fundamental.freq);
                if (isFinite(noteNum)) {
                    detectedNoteNames.add(noteNumToName(noteNum));
                }
            }
            
            const newNotes = Array.from(detectedNoteNames).sort();
            setDetectedNotes(prev => {
                const prevSorted = [...prev].sort();
                if (newNotes.length !== prevSorted.length || newNotes.some((n, i) => n !== prevSorted[i])) {
                    return newNotes;
                }
                return prev;
            });

        } else {
            setDetectedNotes(prev => (prev.length > 0 ? [] : prev));
        }
        
        animationFrameRef.current = requestAnimationFrame(processAudio);
    }, [isListening]);

    const startListening = useCallback(async () => {
        setError(null);
        if (isListening || !navigator.mediaDevices) {
            return;
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = FFT_SIZE;
            analyserRef.current.smoothingTimeConstant = 0.1;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current.connect(analyserRef.current);

            setIsListening(true);
            setDetectedNotes([]);
            
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (!isListening) {
            return;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        sourceRef.current?.disconnect();
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
        }

        setIsListening(false);
    }, [isListening]);
    
    useEffect(() => {
        if (isListening) {
            animationFrameRef.current = requestAnimationFrame(processAudio);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
        return () => {
             if (isListening) {
                 stopListening();
             }
        };
    }, [isListening, processAudio, stopListening]);

    return { detectedNotes, isListening, startListening, stopListening, error };
};