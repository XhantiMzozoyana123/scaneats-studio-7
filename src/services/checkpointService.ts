
'use server';

import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { getMealInsights } from '@/ai/flows/meal-insights';
import { personalizedDietarySuggestions } from '@/ai/flows/personalized-dietary-suggestions';
import { sallyHealthInsights } from '@/ai/flows/sally-health-insights';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { API_BASE_URL } from '@/lib/api';

// Map flow names to their functions and credit costs
const availableFlows: Record<string, { func: Function; cost: number }> = {
  'food-scan-nutrition': { func: foodScanNutrition, cost: 1 },
  'meal-insights': { func: getMealInsights, cost: 1 },
  'sally-health-insights': { func: sallyHealthInsights, cost: 1 },
  'personalized-dietary-suggestions': { func: personalizedDietarySuggestions, cost: 1 },
  'text-to-speech': { func: textToSpeech, cost: 0 }, // TTS is often free or very low cost
};

async function getRemainingCredits(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/credit/balance`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return 0;
  const data = await response.json();
  return data.credits || 0;
}

async function deductCredits(token: string, amount: number): Promise<boolean> {
  if (amount === 0) return true;
  const response = await fetch(`${API_BASE_URL}/api/event/deduct-credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(amount),
    cache: 'no-store',
  });
  return response.ok;
}

/**
 * Executes a protected AI flow by first performing server-side checks for credit status.
 * Throws specific errors for the UI to handle based on the checks.
 * @param token - The user's authentication token.
 * @param flowName - The name of the AI flow to run.
 * @param payload - The data to send to the AI flow.
 * @returns The result of the action function.
 */
export async function runProtectedAction<T>(
  token: string,
  flowName: string,
  payload: any
): Promise<T> {
  if (!token) {
    // This case should be handled client-side, but as a safeguard:
    throw new Error('Authentication token is missing.');
  }

  const flowConfig = availableFlows[flowName];
  if (!flowConfig) {
    throw new Error(`Flow not found: ${flowName}`);
  }

  // --- Server-side Credit Check ---
  const remainingCredits = await getRemainingCredits(token);
  if (remainingCredits < flowConfig.cost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  // --- End Checkpoint ---

  try {
    const result = await flowConfig.func(payload);

    // Deduct credits only after the action succeeds
    const deductionSuccess = await deductCredits(token, flowConfig.cost);
    if (!deductionSuccess) {
      // Log this failure, but don't fail the whole operation since the user already got the result
      console.warn(`Failed to deduct ${flowConfig.cost} credits for flow: ${flowName}`);
    }

    return result;
  } catch (err: any) {
    console.error(`Error executing flow ${flowName}:`, err);
    // Re-throw the error to be handled by the client
    throw new Error(err.message || 'An internal error occurred during flow execution.');
  }
}
