'use server';
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - textToSpeech - A function that handles converting text to speech.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

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

      return {
        media: 'data:audio/mp3;base64,' + media.url.substring(media.url.indexOf(',') + 1),
      };
    } catch (error: any) {
      console.error('Error during ai.generate call:', error);
      throw new Error(`Text-to-speech generation failed: ${error.message}`);
    }
  }
);
