
'use server';

import { headers } from 'next/headers';
import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { getMealInsights } from '@/ai/flows/meal-insights';
import { personalizedDietarySuggestions } from '@/ai/flows/personalized-dietary-suggestions';
import { API_BASE_URL } from '@/lib/api';

// Map flow names to their functions and credit costs
const availableFlows: Record<string, { func: Function; cost: number }> = {
  'food-scan-nutrition': { func: foodScanNutrition, cost: 1 },
  'meal-insights': { func: getMealInsights, cost: 1 },
  'personalized-dietary-suggestions': { func: personalizedDietarySuggestions, cost: 1 },
};

async function checkSubscriptionStatus(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/event/subscription/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data.isSubscribed === true;
}

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
 * Executes a protected AI flow by first performing server-side checks for subscription and credit status.
 * Throws specific errors for the UI to handle based on the checks.
 * @param flowName - The name of the AI flow to run.
 * @param payload - The data to send to the AI flow.
 * @returns The result of the action function.
 */
export async function runProtectedAction<T>(
  flowName: string,
  payload: any,
): Promise<T> {
  const headersList = headers();
  const token = headersList.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }

  const flowConfig = availableFlows[flowName];
  if (!flowConfig) {
    throw new Error(`Flow not found: ${flowName}`);
  }

  // --- Server-side Checkpoint Logic ---
  const isSubscribed = await checkSubscriptionStatus(token);
  if (!isSubscribed) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }

  const remainingCredits = await getRemainingCredits(token);
  if (remainingCredits < flowConfig.cost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  // --- End Checkpoint ---

  try {
    const result = await flowConfig.func(payload);

    // Deduct credits after successful action
    await deductCredits(token, flowConfig.cost);

    return result;
  } catch (err: any) {
    console.error(`Error executing flow ${flowName}:`, err);
    // Re-throw the error to be handled by the client
    throw new Error(err.message || 'An internal error occurred during flow execution.');
  }
}
