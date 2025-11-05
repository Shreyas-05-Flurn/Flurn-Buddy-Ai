/**
 * A singleton service to manage the global Web Audio API AudioContext.
 * This ensures that we use a single context across the application,
 * which can be unlocked by an initial user gesture (like a login button click)
 * and then used for subsequent audio playback.
 */
class AudioService {
    private static instance: AudioService;
    public audioContext: AudioContext | null = null;

    private constructor() {
        // This code runs only once when the singleton is first instantiated.
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
            try {
                // Create the single audio context for the entire app.
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            } catch (e) {
                console.error("Web Audio API could not be initialized.", e);
            }
        } else {
            console.warn("Web Audio API is not supported in this browser.");
        }
    }

    /**
     * Gets the singleton instance of the AudioService.
     */
    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    /**
     * Resumes the audio context if it is in a suspended state.
     * This must be called in response to a user gesture (e.g., a click).
     */
    public async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.error("Could not resume audio context:", e);
            }
        }
    }
}

export const audioService = AudioService.getInstance();
