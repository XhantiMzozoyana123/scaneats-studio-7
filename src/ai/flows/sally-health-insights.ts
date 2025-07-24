
'use server';

/**
 * @fileOverview An AI agent that provides health insights based on user profile.
 *
 * - sallyHealthInsights - A function that handles the process of providing health insights.
 * - SallyHealthInsightsInput - The input type for the sallyHealthInsights function.
 * - SallyHealthInsightsOutput - The return type for the sallyHealthInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SallyHealthInsightsInputSchema = z.object({
  userProfileJson: z
    .string()
    .describe("A JSON string of the user's profile data."),
  userQuery: z
    .string()
    .describe("The user's question about their health."),
});
export type SallyHealthInsightsInput = z.infer<
  typeof SallyHealthInsightsInputSchema
>;

const SallyHealthInsightsOutputSchema = z.object({
  response: z
    .string()
    .describe(
      "A helpful and conversational response to the user's query about their health."
    ),
});
export type SallyHealthInsightsOutput = z.infer<
  typeof SallyHealthInsightsOutputSchema
>;

export const sallyHealthInsights = ai.defineFlow(
  {
    name: 'sallyHealthInsights',
    inputSchema: SallyHealthInsightsInputSchema,
    outputSchema: SallyHealthInsightsOutputSchema,
  },
  async (input) => {
    const prompt = `You are Sally, a funny, witty, and helpful personal AI nutritionist and health assistant.
A user is asking a question about their health. Your response should be pure human text, not JSON.

Here is the user's profile information (as a JSON string):
${input.userProfileJson}

Here is the user's question:
"${input.userQuery}"

Based on all this information, provide a conversational, funny, and helpful response to the user.
Address them directly and use their profile information to make the advice personal.
Keep your response concise and to the point.
`;
    
    const {output} = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        schema: SallyHealthInsightsOutputSchema,
      }
    });

    if (!output) {
      throw new Error("Failed to get a response from the model.");
    }
    
    return output;
  }
);
