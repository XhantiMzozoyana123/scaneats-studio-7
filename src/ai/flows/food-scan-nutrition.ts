
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
  name: z.string().describe('The name of the food item.'),
  calories: z.number().describe('The total number of calories.'),
  protein: z.number().describe('The amount of protein in grams.'),
  fat: z.number().describe('The amount of fat in grams.'),
  carbohydrates: z.number().describe('The amount of carbohydrates in grams.'),
});
export type FoodScanNutritionOutput = z.infer<typeof FoodScanNutritionOutputSchema>;

export async function foodScanNutrition(
  input: FoodScanNutritionInput
): Promise<FoodScanNutritionOutput> {
  return foodScanNutritionFlow(input);
}

// First step: Simple prompt to just get the name of the food
const identifyFoodPrompt = ai.definePrompt({
  name: 'identifyFoodPrompt',
  input: {schema: z.object({ photoDataUri: z.string() })},
  prompt: `Give me the name of the food that's on this plate. Just the name.
  
  Photo: {{media url=photoDataUri}}`,
});


// Second step: Detailed prompt to get nutritional info based on the food name
const getNutritionPrompt = ai.definePrompt({
  name: 'getNutritionPrompt',
  input: {
    schema: z.object({
      photoDataUri: z.string(),
      mealName: z.string(),
    }),
  },
  output: {
    schema: z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      fat: z.number(),
      carbohydrates: z.number(),
    }),
  },
  prompt: `You are a nutritional expert. Examine the image very carefully.
The food has been identified as: {{{mealName}}}.

Based on this, estimate the approximate food macronutrients in grams and total calories.
The total calories should be calculated as: (protein * 4) + (carbohydrates * 4) + (fat * 9).

Provide your response in a valid JSON object only, following the specified schema.
- No extra explanation, comments, or text outside the JSON.
- Ensure the data is as accurate as possible based on the visual information.

Photo: {{media url=photoDataUri}}
`,
});

const foodScanNutritionFlow = ai.defineFlow(
  {
    name: 'foodScanNutritionFlow',
    inputSchema: FoodScanNutritionInputSchema,
    outputSchema: FoodScanNutritionOutputSchema,
  },
  async (input) => {
    // Step 1: Identify the food to get its name
    const identifyResponse = await identifyFoodPrompt({ photoDataUri: input.photoDataUri });
    const mealName = identifyResponse.text.trim();

    // Step 2: Use the meal name to get detailed nutritional info
    const nutritionResponse = await getNutritionPrompt({
        photoDataUri: input.photoDataUri,
        mealName: mealName,
    });
    
    // The model output should be a clean JSON object based on the prompt's output schema
    const nutritionOutput = nutritionResponse.output;

    if (!nutritionOutput) {
        throw new Error("Failed to get nutritional information from the model.");
    }
    
    return nutritionOutput;
  }
);
