import { audioService } from './AudioService';

export const useAudio = () => {
    const playNote = (note: string) => {
        audioService.playNotes(note);
    };

    return { playNote };
};
