import { PIANO_SAMPLES } from './pianoSamples';
import { decode } from '../utils/audioUtils';

/**
 * A singleton service to manage the global Web Audio API AudioContext and playback of audio samples.
 */
class AudioService {
    private static instance: AudioService;
    public audioContext: AudioContext | null = null;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private isLoadingSamples = false;

    private constructor() {
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
            try {
                // Use default sample rate for best quality
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.loadSamples(); // Start loading samples on initialization
            } catch (e) {
                console.error("Web Audio API could not be initialized.", e);
            }
        } else {
            console.warn("Web Audio API is not supported in this browser.");
        }
    }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    private async loadSamples() {
        if (!this.audioContext || this.isLoadingSamples || this.audioBuffers.size > 0) return;
        this.isLoadingSamples = true;
        
        const promises = Object.entries(PIANO_SAMPLES).map(async ([note, base64Data]) => {
            try {
                const decodedData = decode(base64Data);
                const arrayBuffer = decodedData.buffer;
                const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
                this.audioBuffers.set(note, audioBuffer);
            } catch (error) {
                console.error(`Failed to load sample for ${note}:`, error);
            }
        });

        await Promise.all(promises);
        this.isLoadingSamples = false;
    }

    public async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.error("Could not resume audio context:", e);
            }
        }
    }

    public playNotes(notes: string | string[]) {
        this.resumeContext();
        if (!this.audioContext || this.isLoadingSamples) return;

        const notesToPlay = Array.isArray(notes) ? notes : [notes];

        notesToPlay.forEach(note => {
            const buffer = this.audioBuffers.get(note);
            if (buffer) {
                const source = this.audioContext!.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext!.destination);
                source.start();
            }
        });
    }
}

export const audioService = AudioService.getInstance();