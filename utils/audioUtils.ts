// --- utils/audioUtils.ts ---

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 encoded string.
 * @returns The decoded byte array.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * This is necessary because the Gemini TTS API returns raw audio data, not a standard file format like .wav or .mp3.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use for decoding.
 * @param sampleRate The sample rate of the audio (24000 for Gemini TTS).
 * @param numChannels The number of audio channels (typically 1 for mono).
 * @returns A promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is 16-bit PCM, so we create a Int16Array view on the buffer.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  
  // Create an empty AudioBuffer with the correct parameters.
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  // Fill the AudioBuffer with the PCM data, converting it from 16-bit integer to 32-bit float.
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // The PCM data is in the range of -32768 to 32767. We need to normalize it to the -1.0 to 1.0 range.
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
