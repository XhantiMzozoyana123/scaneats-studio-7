
import { API_BASE_URL } from '@/lib/api';

/**
 * Executes a protected action after verifying subscription and credit status on the client-side.
 * This is a wrapper around a fetch call to our own API gateway, which then performs secure server-side checks.
 * Throws specific errors for the UI to handle.
 * @param flowName - The name of the AI flow to run (e.g., 'food-scan-nutrition').
 * @param payload - The data to send to the AI flow.
 * @param bypassSubscriptionCheck - If true, calls an endpoint that skips the check (e.g., account deletion).
 * @returns The result of the action function.
 */
export async function runProtectedAction<T>(
  flowName: string,
  payload: any,
  bypassSubscriptionCheck: boolean = false
): Promise<T> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('AUTH_TOKEN_MISSING');
  }

  // The client-side `runProtectedAction` now acts as a gateway.
  // It calls our own API, which then performs the secure checks on the server.
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

  // Handle specific errors thrown by our API gateway for the UI
  const errorData = await response.json();
  if (response.status === 403) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }
  if (response.status === 429) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  if (response.status === 401) {
    throw new Error('AUTH_TOKEN_MISSING');
  }

  // Handle other generic errors
  throw new Error(errorData.error || 'An unexpected error occurred.');
}
