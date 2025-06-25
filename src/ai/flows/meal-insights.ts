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
  foodDescription: z.string().describe('The description of the food item.'),
});
export type GetMealInsightsInput = z.infer<typeof GetMealInsightsInputSchema>;

const GetMealInsightsOutputSchema = z.object({
  calories: z.number().describe('The total calories in the food item.'),
  protein: z.number().describe('The amount of protein in grams in the food item.'),
  fat: z.number().describe('The amount of fat in grams in the food item.'),
  carbs: z.number().describe('The amount of carbohydrates in grams in the food item.'),
  ingredients: z.string().describe('A comma separated list of the ingredients in the food item.'),
  allergens: z.string().describe('A comma separated list of potential allergens in the food item.'),
  healthBenefits: z.string().describe('The health benefits of the food item.'),
  potentialRisks: z.string().describe('The potential health risks of the food item.'),
});
export type GetMealInsightsOutput = z.infer<typeof GetMealInsightsOutputSchema>;

export async function getMealInsights(input: GetMealInsightsInput): Promise<GetMealInsightsOutput> {
  return getMealInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMealInsightsPrompt',
  input: {schema: GetMealInsightsInputSchema},
  output: {schema: GetMealInsightsOutputSchema},
  prompt: `You are a nutritionist providing insights about a food item.

  Analyze the following food description and extract nutritional information, ingredients, allergens, health benefits, and potential risks.

  Food Description: {{{foodDescription}}}
  `,
});

const getMealInsightsFlow = ai.defineFlow(
  {
    name: 'getMealInsightsFlow',
    inputSchema: GetMealInsightsInputSchema,
    outputSchema: GetMealInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
