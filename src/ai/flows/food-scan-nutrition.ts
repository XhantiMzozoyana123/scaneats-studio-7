'use server';
/**
 * @fileOverview Food item scanner and nutritional information provider.
 *
 * - foodScanNutrition - A function that handles the food scanning process and provides nutritional information.
 * - FoodScanNutritionInput - The input type for the foodScanNutrition function.
 * - FoodScanNutritionOutput - The return type for the foodScanNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodScanNutritionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FoodScanNutritionInput = z.infer<typeof FoodScanNutritionInputSchema>;

const FoodScanNutritionOutputSchema = z.object({
  foodIdentification: z.object({
    name: z.string().describe('The identified name of the food item.'),
    confidence: z
      .number()
      .describe('The confidence level of the food identification.'),
  }),
  nutritionInformation: z.object({
    calories: z.number().describe('The number of calories in the food item.'),
    protein: z.number().describe('The amount of protein in grams.'),
    fat: z.number().describe('The amount of fat in grams.'),
    carbohydrates: z.number().describe('The amount of carbohydrates in grams.'),
    allergens: z
      .array(z.string())
      .describe('A list of potential allergens in the food item.'),
  }),
});
export type FoodScanNutritionOutput = z.infer<typeof FoodScanNutritionOutputSchema>;

export async function foodScanNutrition(input: FoodScanNutritionInput): Promise<FoodScanNutritionOutput> {
  return foodScanNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodScanNutritionPrompt',
  input: {schema: FoodScanNutritionInputSchema},
  output: {schema: FoodScanNutritionOutputSchema},
  prompt: `You are a nutritional expert. You will identify the food item in the photo and provide detailed nutritional information, including calories, macro-nutrients (protein, fat, carbohydrates), and potential allergens.

  Photo: {{media url=photoDataUri}}
  \nGive me the food identification and nutrition information in JSON format. Make sure the data is accurate.`,
});

const foodScanNutritionFlow = ai.defineFlow(
  {
    name: 'foodScanNutritionFlow',
    inputSchema: FoodScanNutritionInputSchema,
    outputSchema: FoodScanNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
