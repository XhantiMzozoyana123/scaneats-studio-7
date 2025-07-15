
/**
 * @fileoverview This is a generic API route handler for Genkit flows.
 * It dynamically handles POST requests to /api/ai/[flowName],
 * verifies authentication, and runs the corresponding flow.
 */

import {NextRequest, NextResponse} from 'next/server';
import { z } from 'zod';
import { runProtectedAction } from '@/services/checkpointService';
import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { getMealInsights } from '@/ai/flows/meal-insights';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { personalizedDietarySuggestions } from '@/ai/flows/personalized-dietary-suggestions';

// Map flow names to their functions
const availableFlows: Record<string, Function> = {
  'food-scan-nutrition': foodScanNutrition,
  'meal-insights': getMealInsights,
  'text-to-speech': textToSpeech,
  'personalized-dietary-suggestions': personalizedDietarySuggestions,
};

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const flowName = params.slug.join('/');

  try {
    const input = await req.json();

    // The 'runProtectedAction' service now encapsulates the business logic
    // for credit checks and subscription status before executing the AI flow.
    const result = await runProtectedAction(async () => {
      const flowFunction = availableFlows[flowName];
      if (typeof flowFunction !== 'function') {
        throw new Error(`Flow ${flowName} is not an available function.`);
      }
      return await flowFunction(input);
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`Error processing flow ${flowName}:`, err);

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    
    // Handle specific errors from checkpointService
    if (err.message === 'SUBSCRIPTION_REQUIRED') {
        return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }
    if (err.message === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 429 });
    }
    if (err.message === 'AUTH_TOKEN_MISSING') {
        return NextResponse.json({ error: 'Authentication token missing' }, { status: 401 });
    }

    return NextResponse.json({ error: err.message || 'An internal error occurred' }, { status: 500 });
  }
}
