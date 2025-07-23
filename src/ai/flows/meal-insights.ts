
'use server';

/**
 * @fileOverview An AI agent that provides insights about a scanned meal or user health.
 *
 * - getMealInsights - A function that handles the process of providing meal insights.
 * - GetMealInsightsInput - The input type for the getMealInsights function.
 * - GetMealInsightsOutput - The return type for the getMealInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMealInsightsInputSchema = z.object({
  foodItemName: z.string().describe('The name of the scanned food item, or a general topic like "my body".'),
  nutritionalInformation: z
    .string()
    .describe(
      'A JSON string of nutritional information for the food item or the user\'s profile data.'
    ),
  userQuery: z.string().describe('The user\'s question about the meal or their health.'),
});
export type GetMealInsightsInput = z.infer<typeof GetMealInsightsInputSchema>;

const GetMealInsightsOutputSchema = z.object({
  response: z
    .string()
    .describe('A helpful and conversational response to the user\'s query about their meal or health.'),
});
export type GetMealInsightsOutput = z.infer<typeof GetMealInsightsOutputSchema>;

export async function getMealInsights(
  input: GetMealInsightsInput
): Promise<GetMealInsightsOutput> {
  return getMealInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMealInsightsPrompt',
  input: {schema: GetMealInsightsInputSchema},
  output: {schema: GetMealInsightsOutputSchema},
  prompt: `You are Sally, a funny, witty, and helpful personal AI nutritionist.
  A user is asking a question. Your response should be pure human text, not JSON.

  Here is the context for their question:
  - Topic/Food Name: {{{foodItemName}}}
  - Contextual Information (JSON): {{{nutritionalInformation}}}

  Here is the user's question:
  "{{{userQuery}}}"

  Based on all this information, provide a conversational, funny, and helpful response to the user.
  Address them directly. For example, if they ask "is this healthy?", you could say "Well, let's take a look at this {{{foodItemName}}}...".
  Keep your response concise and to the point.
  `,
});

const getMealInsightsFlow = ai.defineFlow(
  {
    name: 'getMealInsightsFlow',
    inputSchema: GetMealInsightsInputSchema,
    outputSchema: GetMealInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
