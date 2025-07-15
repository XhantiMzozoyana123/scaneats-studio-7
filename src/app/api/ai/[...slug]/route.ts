
/**
 * @fileoverview This is a generic API route handler for Genkit flows.
 * It dynamically handles POST requests to /api/ai/[flowName],
 * verifies authentication, and runs the corresponding flow.
 */

import {NextRequest, NextResponse} from 'next/server';
import { z } from 'zod';
import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { getMealInsights } from '@/ai/flows/meal-insights';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { personalizedDietarySuggestions } from '@/ai/flows/personalized-dietary-suggestions';
import { API_BASE_URL } from '@/lib/api';


// Server-side function to delete the account by calling the main backend
async function deleteUserAccount(token: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/delete-account`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        return { success: true };
    } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete account.' }));
        return { success: false, message: errorData.error || 'An unexpected error occurred during account deletion.' };
    }
}

// Map flow names to their functions and credit costs
const availableFlows: Record<string, { func: Function; cost: number; bypassSubCheck?: boolean }> = {
  'food-scan-nutrition': { func: foodScanNutrition, cost: 1 },
  'meal-insights': { func: getMealInsights, cost: 1 },
  'text-to-speech': { func: textToSpeech, cost: 1 },
  'personalized-dietary-suggestions': { func: personalizedDietarySuggestions, cost: 1 },
  'delete-account': { func: deleteUserAccount, cost: 0, bypassSubCheck: true },
};

async function checkSubscriptionStatus(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/event/subscription/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data.isSubscribed === true;
}

async function getRemainingCredits(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/credit/balance`, {
    headers: { Authorization: `Bearer ${token}` },
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
    });
    return response.ok;
}


export async function POST(
  req: NextRequest,
  context: { params: { slug: string[] } }
) {
  const flowName = context.params.slug[0];
  const flowConfig = availableFlows[flowName];
  
  if (!flowConfig) {
    return NextResponse.json({ error: `Flow not found: ${flowName}` }, { status: 404 });
  }

  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
  }

  try {
    // --- Server-side Checkpoint Logic ---
    if (!flowConfig.bypassSubCheck) {
        const isSubscribed = await checkSubscriptionStatus(token);
        if (!isSubscribed) {
            return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
        }

        const remainingCredits = await getRemainingCredits(token);
        if (remainingCredits < flowConfig.cost) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 429 });
        }
    }
    // --- End Checkpoint ---
    
    // For delete-account, the function expects the token. For others, it expects the request body.
    const input = flowName === 'delete-account' ? token : await req.json();
    const result = await flowConfig.func(input);

    // If account deletion fails, result will contain { success: false, message: '...' }
     if (flowName === 'delete-account') {
        const deleteResult = result as { success: boolean; message?: string };
        if (!deleteResult.success) {
            return NextResponse.json({ error: deleteResult.message }, { status: 400 });
        }
    }


    // Deduct credits after successful action
    if (!flowConfig.bypassSubCheck) {
        await deductCredits(token, flowConfig.cost);
    }
    
    return NextResponse.json(result);

  } catch (err: any) {
    console.error(`Error processing flow ${flowName}:`, err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'An internal error occurred' }, { status: 500 });
  }
}
