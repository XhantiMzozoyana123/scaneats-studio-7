import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = "AIzaSyBICB1QosBgGxUrIZ40sS_3hUU57fg7Uh0";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  model: 'googleai/gemini-2.0-flash',
});
