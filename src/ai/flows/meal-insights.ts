
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
  ingredients: z
    .string()
    .describe('A comma-separated list of the ingredients in the food item.'),
  healthBenefits: z.string().describe('The health benefits of the food item.'),
  potentialRisks: z
    .string()
    .describe('The potential health risks of the food item.'),
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
  A user has asked for insights about a food item or their health based on their profile.
  Your response should be conversational and match your personality.
  
  Your primary task is to provide a structured response in JSON format based on the following:
  - Topic/Food Name: {{{foodItemName}}}
  - Nutritional/Profile Information: {{{nutritionalInformation}}}
  - User's Question: {{{userQuery}}}

  Based on the topic, the provided data, and the user's specific question, describe its likely ingredients (if applicable), its health benefits, and potential risks.
  Use the user's question to guide the focus of your answer.
  Fill out the 'ingredients', 'healthBenefits', and 'potentialRisks' fields in the JSON output.
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
