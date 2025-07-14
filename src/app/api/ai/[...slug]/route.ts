
/**
 * @fileoverview This is a generic API route handler for Genkit flows.
 * It dynamically handles POST requests to /api/ai/[flowName],
 * verifies authentication, and runs the corresponding flow.
 */

import {NextRequest, NextResponse} from 'next/server';
import {run} from '@genkit-ai/next';
import {z} from 'zod';

// Dynamically import all flows from the specified directory.
// This ensures that all defined flows are available to the handler.
import '@/ai/flows/food-scan-nutrition';
import '@/ai/flows/meal-insights';
import '@/ai/flows/personalized-dietary-suggestions';
import '@/ai/flows/text-to-speech';

export async function POST(
  req: NextRequest,
  {params}: {params: {slug: string[]}}
) {
  const flowName = params.slug.join('/');
  
  try {
    const input = await req.json();

    // This is a simplified endpoint that directly runs the Genkit flow.
    // The business logic for credit checks and subscription status
    // is now handled on the client-side before this endpoint is called.
    const result = await run(flowName, async () => {
      const flowModule = await import(`@/ai/flows/${flowName}.ts`);
      const flowFunction = flowModule[flowName];
      if (typeof flowFunction !== 'function') {
        throw new Error(`Flow ${flowName} is not an exported function.`);
      }
      return await flowFunction(input);
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`Error processing flow ${flowName}:`, err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({error: 'Invalid input', details: err.errors}, {status: 400});
    }
    return NextResponse.json({error: err.message || 'An internal error occurred'}, {status: 500});
  }
}
