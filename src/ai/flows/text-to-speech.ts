
'use server';
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - textToSpeech - A function that handles converting text to speech.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import wav from 'wav';

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
      
      const wavData = await toWav(audioBuffer);

      return {
        media: 'data:audio/wav;base64,' + wavData,
      };
    } catch (error: any) {
      console.error('Error during TTS ai.generate call:', error);
      throw new Error(`Text-to-speech generation failed: ${error.message}`);
    }
  }
);


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', (err) => {
        console.error('WAV conversion error:', err);
        reject(err);
    });
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
