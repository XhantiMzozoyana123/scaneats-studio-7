'use server';
/**
 * @fileOverview An AI agent that provides personalized dietary suggestions based on scanned food items, dietary goals, and user preferences.
 *
 * - personalizedDietarySuggestions - A function that generates personalized dietary suggestions.
 * - PersonalizedDietarySuggestionsInput - The input type for the personalizedDietarySuggestions function.
 * - PersonalizedDietarySuggestionsOutput - The return type for the personalizedDietarySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDietarySuggestionsInputSchema = z.object({
  foodItemName: z.string().describe('The name of the scanned food item.'),
  nutritionalInformation: z.string().describe('Nutritional information of the food item, including calories, macro-nutrients, and potential allergens.'),
  dietaryGoals: z.string().describe('The user’s dietary goals, such as weight loss, muscle gain, or general health improvement.'),
  userPreferences: z.string().describe('The user’s dietary preferences and restrictions.'),
});
export type PersonalizedDietarySuggestionsInput = z.infer<typeof PersonalizedDietarySuggestionsInputSchema>;

const PersonalizedDietarySuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('Personalized dietary suggestions and recommendations based on the input data.'),
});
export type PersonalizedDietarySuggestionsOutput = z.infer<typeof PersonalizedDietarySuggestionsOutputSchema>;

export async function personalizedDietarySuggestions(
  input: PersonalizedDietarySuggestionsInput
): Promise<PersonalizedDietarySuggestionsOutput> {
  return personalizedDietarySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDietarySuggestionsPrompt',
  input: {schema: PersonalizedDietarySuggestionsInputSchema},
  output: {schema: PersonalizedDietarySuggestionsOutputSchema},
  prompt: `You are a personal nutritionist providing dietary suggestions.

  Based on the following information about a scanned food item, the user's dietary goals, and their preferences, provide personalized dietary suggestions and recommendations.

  Food Item Name: {{{foodItemName}}}
  Nutritional Information: {{{nutritionalInformation}}}
  Dietary Goals: {{{dietaryGoals}}}
  User Preferences: {{{userPreferences}}}

  Suggestions:
`,
});

const personalizedDietarySuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedDietarySuggestionsFlow',
    inputSchema: PersonalizedDietarySuggestionsInputSchema,
    outputSchema: PersonalizedDietarySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
