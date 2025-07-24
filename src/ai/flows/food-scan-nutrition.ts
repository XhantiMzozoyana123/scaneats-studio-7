
'use server';
/**
 * @fileOverview Food item scanner and nutritional information provider.
 * This flow replicates the two-step AI process from the original C# backend.
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
      "A photo of the food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type FoodScanNutritionInput = z.infer<typeof FoodScanNutritionInputSchema>;

const FoodScanNutritionOutputSchema = z.object({
  foodIdentification: z.object({
    name: z.string().describe('The identified name of the food item.'),
    confidence: z
      .number()
      .describe('The confidence level of the food identification (0-1).'),
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

export const foodScanNutrition = ai.defineFlow(
  {
    name: 'foodScanNutrition',
    inputSchema: FoodScanNutritionInputSchema,
    outputSchema: FoodScanNutritionOutputSchema,
  },
  async ({ photoDataUri }) => {
    const prompt = `You are a nutritional expert. You will identify the food item in the photo and provide detailed nutritional information, including calories, macro-nutrients (protein, fat, carbohydrates), and potential allergens.

    Photo: {{media url=photoDataUri}}
    
    Give me the food identification and nutrition information in JSON format. Make sure the data is accurate. If you cannot determine the calories, set it to 0.`;

    const { output } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      input: {
        photoDataUri
      },
      output: {
        schema: FoodScanNutritionOutputSchema,
      },
    });

    if (!output) {
      throw new Error("Failed to get a response from the model.");
    }
    
    // If calories are 0, calculate them manually for better accuracy
    if (output.nutritionInformation.calories === 0) {
      const { protein, carbohydrates, fat } = output.nutritionInformation;
      output.nutritionInformation.calories = Math.round((protein * 4) + (carbohydrates * 4) + (fat * 9));
    }

    return output;
  }
);
