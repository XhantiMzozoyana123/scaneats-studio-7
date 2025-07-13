'use server';
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - textToSpeech - A function that handles converting text to speech.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import lamejs from 'lamejs';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe('The base64 encoded audio data URI.'),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  if (!input.text) {
    throw new Error('Input text cannot be empty.');
  }
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({text}) => {
    try {
      const {media} = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {voiceName: 'Kore'},
            },
          },
        },
        prompt: text,
      });

      if (!media?.url) {
        console.error('TTS media object:', media);
        throw new Error('No audio media returned from the TTS model.');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const mp3Data = toMp3(audioBuffer);

      return {
        media: 'data:audio/mpeg;base64,' + mp3Data.toString('base64'),
      };
    } catch (error: any) {
      console.error('Error during ai.generate call:', error);
      throw new Error(`Text-to-speech generation failed: ${error.message}`);
    }
  }
);


function toMp3(
  pcmData: Buffer,
  channels = 1,
  sampleRate = 24000,
): Buffer {
    const pcm_i16 = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / 2);

    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
    const mp3Data: Int8Array[] = [];

    const sampleBlockSize = 1152; // must be 1152
    for (let i = 0; i < pcm_i16.length; i += sampleBlockSize) {
        const sampleChunk = pcm_i16.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of mp3Data) {
        result.set(buf, offset);
        offset += buf.length;
    }
    
    return Buffer.from(result.buffer);
}