
'use server';
/**
 * @fileOverview An AI agent that provides insights about user health based on their profile.
 *
 * - sallyHealthInsights - A function that handles the process of providing health insights.
 * - SallyHealthInsightsInput - The input type for the sallyHealthInsights function.
 * - SallyHealthInsightsOutput - The return type for the sallyHealthInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  gender: z.string(),
  weight: z.union([z.number(), z.string()]),
  goals: z.string(),
  birthDate: z.date().nullable(),
  age: z.number().optional(),
  isSubscribed: z.boolean().optional(),
  email: z.string().optional(),
});

const SallyHealthInsightsInputSchema = z.object({
  userProfile: UserProfileSchema.describe("The user's profile information."),
  userQuery: z.string().describe("The user's question about their health."),
});
export type SallyHealthInsightsInput = z.infer<typeof SallyHealthInsightsInputSchema>;

const SallyHealthInsightsOutputSchema = z.object({
  response: z.string().describe('A conversational and helpful response to the user\'s query.'),
});
export type SallyHealthInsightsOutput = z.infer<typeof SallyHealthInsightsOutputSchema>;

export async function sallyHealthInsights(
  input: SallyHealthInsightsInput
): Promise<SallyHealthInsightsOutput> {
  return sallyHealthInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sallyHealthInsightsPrompt',
  input: {schema: SallyHealthInsightsInputSchema},
  output: {schema: SallyHealthInsightsOutputSchema},
  prompt: `You are Sally, a funny, witty, and helpful personal AI nutritionist and health assistant. 
  A user has asked for insights about their health.
  Your response should be conversational, encouraging, and match your personality.
  
  Your primary task is to provide a helpful response based on the user's profile and their question.
  - User Profile: {{{json userProfile}}}
  - User's Question: {{{userQuery}}}

  Use the user's question and their profile data (like goals, weight, etc.) to give a relevant and personalized answer.
  Provide a single, conversational string in the 'response' field of the JSON output.
  `,
});

const sallyHealthInsightsFlow = ai.defineFlow(
  {
    name: 'sallyHealthInsightsFlow',
    inputSchema: SallyHealthInsightsInputSchema,
    outputSchema: SallyHealthInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
