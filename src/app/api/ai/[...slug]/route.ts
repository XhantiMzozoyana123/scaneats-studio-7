
/**
 * @fileoverview This is a generic API route handler for Genkit flows.
 * It dynamically handles POST requests to /api/ai/[flowName],
 * verifies authentication, and runs the corresponding flow.
 */

import {NextRequest, NextResponse} from 'next/server';
import {run} from '@genkit-ai/next';
import {z} from 'zod';
import {API_BASE_URL} from '@/lib/api';

// Dynamically import all flows from the specified directory.
// This ensures that all defined flows are available to the handler.
import '@/ai/flows/food-scan-nutrition';
import '@/ai/flows/meal-insights';
import '@/ai/flows/personalized-dietary-suggestions';
import '@/ai/flows/text-to-speech';


// Define a special schema for a combined operation to optimize API calls.
const GetMealInsightsAndSpeechInputSchema = z.object({
  foodItemName: z.string(),
  nutritionalInformation: z.string(),
  userQuery: z.string(),
});

export async function POST(
  req: NextRequest,
  {params}: {params: {slug: string[]}}
) {
  const flowName = params.slug.join('/');
  const authToken = req.headers.get('Authorization')?.split(' ')[1];

  if (!authToken) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const input = await req.json();

    // The actual credit check and business logic is handled by the main backend.
    // We forward the request to the appropriate endpoint on the main backend.
    const backendResponse = await fetch(`${API_BASE_URL}/api/ai/${flowName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!backendResponse.ok) {
      // If the backend returns an error (e.g., 401, 403, 429),
      // we forward that error response directly to the client.
      const errorBody = await backendResponse.text();
      return new NextResponse(errorBody, {
        status: backendResponse.status,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // If the backend call is successful, we proceed with running the Genkit flow locally.
    // This architecture assumes the backend's role is primarily for authentication and rate-limiting,
    // while the AI processing happens within this Next.js environment.

    // Handle the special combined flow case.
    if (flowName === 'getMealInsightsAndSpeech') {
      const {getMealInsights} = await import('@/ai/flows/meal-insights');
      const {textToSpeech} = await import('@/ai/flows/text-to-speech');
      const validatedInput = GetMealInsightsAndSpeechInputSchema.parse(input);

      const insightsResult = await getMealInsights(validatedInput);

      let ttsResult = null;
      try {
        if (insightsResult.response) {
            ttsResult = await textToSpeech({ text: insightsResult.response });
        }
      } catch (ttsError) {
        console.error("TTS generation failed:", ttsError);
        // Do not throw; we can still return the text insight.
        ttsResult = { error: "Failed to generate audio." };
      }
      
      return NextResponse.json({insights: insightsResult, tts: ttsResult});
    }


    // For all other standard flows, use the generic 'run' helper.
    const result = await run(flowName, async () => {
      // Re-import the specific flow to ensure it's loaded, then run it.
      // This is slightly redundant but ensures the dynamic import system works.
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
