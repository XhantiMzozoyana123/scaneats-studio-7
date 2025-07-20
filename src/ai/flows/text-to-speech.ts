
'use server';

/**
 * @fileOverview A text-to-speech AI agent that outputs MP3 audio.
 *
 * - textToSpeech - A function that converts text to speech audio.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Mp3Encoder } from 'lamejs';

const TextToSpeechInputSchema = z.string().describe('The text to be converted to speech.');
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe("The generated audio as a data URI in MP3 format. Expected format: 'data:audio/mpeg;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

// Helper to convert raw PCM audio buffer to an MP3 buffer
function pcmToMp3(pcmBuffer: Buffer, channels = 1, sampleRate = 24000): Buffer {
    const pcmI16 = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
    
    const encoder = new Mp3Encoder(channels, sampleRate, 128); // 128 kbps bitrate
    const mp3Data: Int8Array[] = [];
    
    const sampleBlockSize = 1152; // MP3 frame size
    for (let i = 0; i < pcmI16.length; i += sampleBlockSize) {
        const sampleChunk = pcmI16.subarray(i, i + sampleBlockSize);
        const mp3buf = encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    
    const mp3buf = encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    return Buffer.concat(mp3Data.map(d => Buffer.from(d.buffer)));
}


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (text) => {
    if (!text) {
      throw new Error('Input text is empty.');
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Vega' }, // A young, clear female voice
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media returned from TTS model');
    }

    const pcmBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const mp3Buffer = pcmToMp3(pcmBuffer);
    const mp3Base64 = mp3Buffer.toString('base64');

    return {
      media: 'data:audio/mpeg;base64,' + mp3Base64,
    };
  }
);
