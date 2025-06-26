'use server';

/**
 * @fileOverview An AI agent that provides insights about a scanned meal.
 *
 * - getMealInsights - A function that handles the process of providing meal insights.
 * - GetMealInsightsInput - The input type for the getMealInsights function.
 * - GetMealInsightsOutput - The return type for the getMealInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMealInsightsInputSchema = z.object({
  foodItemName: z.string().describe('The name of the scanned food item.'),
  nutritionalInformation: z
    .string()
    .describe(
      'A JSON string of nutritional information for the food item.'
    ),
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
  prompt: `You are a nutritionist providing insights about a food item.

  Based on the food name and its nutritional information, describe its likely ingredients, its health benefits, and potential risks.

  Food Name: {{{foodItemName}}}
  Nutritional Information: {{{nutritionalInformation}}}
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
