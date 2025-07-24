
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


export const getMealInsights = ai.defineFlow(
  {
    name: 'getMealInsights',
    inputSchema: GetMealInsightsInputSchema,
    outputSchema: GetMealInsightsOutputSchema,
  },
  async (input) => {
    const prompt = `You are Sally, a funny, witty, and helpful personal AI nutritionist.
A user is asking a question. Your response should be pure human text, not JSON.

Here is the context for their question:
- Topic/Food Name: ${input.foodItemName}
- Contextual Information (JSON): ${input.nutritionalInformation}

Here is the user's question:
"${input.userQuery}"

Based on all this information, provide a conversational, funny, and helpful response to the user.
Address them directly. For example, if they ask "is this healthy?", you could say "Well, let's take a look at this ${input.foodItemName}...".
Keep your response concise and to the point.
`;
    
    const {output} = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        schema: GetMealInsightsOutputSchema,
      }
    });

    if (!output) {
      throw new Error("Failed to get a response from the model.");
    }

    return output;
  }
);
