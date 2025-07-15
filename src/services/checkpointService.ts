
import { API_BASE_URL } from '@/lib/api';

/**
 * Executes a protected action by making a secure call to our internal API gateway.
 * This gateway then performs server-side checks for subscription and credit status.
 * Throws specific errors for the UI to handle based on the API response.
 * @param flowName - The name of the AI flow to run (e.g., 'food-scan-nutrition').
 * @param payload - The data to send to the AI flow.
 * @returns The result of the action function.
 */
export async function runProtectedAction<T>(
  flowName: string,
  payload: any,
): Promise<T> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // This will be caught by the UI and trigger a redirect to login if necessary.
    throw new Error('AUTH_TOKEN_MISSING');
  }

  const response = await fetch(`/api/ai/${flowName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return await response.json();
  }

  // Handle specific, actionable errors thrown by our API gateway for the UI
  const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred.' }));
  
  if (response.status === 403) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }
  if (response.status === 429) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  if (response.status === 401) {
    throw new Error('AUTH_TOKEN_INVALID');
  }

  // Handle other generic errors
  throw new Error(errorData.error || 'An unexpected error occurred.');
}
