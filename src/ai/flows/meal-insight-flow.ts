
'use server';
/**
 * @fileOverview An AI flow to generate nutritional insights for a given meal.
 *
 * - getMealInsight - A function that generates a personalized insight for a meal.
 * - MealInsightInput - The input type for the getMealInsight function.
 */

import { ai } from '@/ai/genkit';
import type { Profile } from '@/app/domain/profile';
import type { ScannedFood } from '@/app/domain/scanned-food';
import { z } from 'genkit';

// Define the Zod schemas for validation
const ProfileSchema = z.object({
  name: z.string().describe('The user\'s name.'),
  gender: z.string().describe('The user\'s gender.'),
  weight: z.union([z.number(), z.string()]).describe('The user\'s weight in kilograms.'),
  goals: z.string().describe('The user\'s health and fitness goals.'),
  birthDate: z.date().nullable().describe('The user\'s birth date.'),
});

const ScannedFoodSchema = z.object({
  id: z.number(),
  name: z.string().describe('The name of the food.'),
  total: z.number().describe('Total calories in the meal.'),
  protein: z.number().describe('Grams of protein in the meal.'),
  fat: z.number().describe('Grams of fat in the meal.'),
  carbs: z.number().describe('Grams of carbohydrates in the meal.'),
});

const MealInsightInputSchema = z.object({
  profile: ProfileSchema,
  meal: ScannedFoodSchema,
  userQuery: z.string().describe('The user\'s question about the meal.'),
});
export type MealInsightInput = z.infer<typeof MealInsightInputSchema>;

// This is the main exported function that the UI will call
export async function getMealInsight(input: MealInsightInput): Promise<string> {
  const { output } = await mealInsightFlow(input);
  return output!;
}

// Define the Genkit prompt for the AI
const mealInsightPrompt = ai.definePrompt({
  name: 'mealInsightPrompt',
  input: { schema: MealInsightInputSchema },
  output: { format: 'text' },
  prompt: `
    You are Sally, a friendly and knowledgeable AI nutritionist.
    Your goal is to provide a concise, helpful, and encouraging insight into a meal a user has just eaten, based on their specific question.
    Keep your response to 2-4 sentences.

    Here is the user's profile:
    - Name: {{{profile.name}}}
    - Goals: {{{profile.goals}}}
    - Weight: {{{profile.weight}}} kg
    - Gender: {{{profile.gender}}}

    Here is the meal they just ate:
    - Meal Name: {{{meal.name}}}
    - Total Calories: {{{meal.total}}}
    - Protein: {{{meal.protein}}}g
    - Carbohydrates: {{{meal.carbs}}}g
    - Fat: {{{meal.fat}}}g

    The user's question is: "{{{userQuery}}}"

    Based on their profile, the meal's nutritional information, and their question, provide a personalized and conversational response.
    Address the user by their name.
  `,
});

// Define the Genkit flow
const mealInsightFlow = ai.defineFlow(
  {
    name: 'mealInsightFlow',
    inputSchema: MealInsightInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await mealInsightPrompt(input);
    return output!;
  }
);
