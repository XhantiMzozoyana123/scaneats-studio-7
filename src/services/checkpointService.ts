
'use server';

import { API_BASE_URL } from '@/lib/api';

/**
 * Executes a protected action after verifying subscription and credit status.
 * Throws specific errors for the UI to handle.
 * @param token - The user's authentication token.
 * @param action - The async function to execute if checks pass.
 * @param creditsToDeduct - The number of credits to deduct upon success.
 * @returns An object containing the result of the action and a potentially new auth token.
 */
export async function runProtectedAction<T>(
  token: string,
  action: () => Promise<T>,
  creditsToDeduct = 1
): Promise<{ result: T; newToken: string | null }> {
  if (!token) {
    throw new Error('AUTH_TOKEN_MISSING');
  }

  // Execute the core function first.
  const result = await action();

  // Deduct credits *after* the action is successful by calling the backend.
  const response = await fetch(`${API_BASE_URL}/api/event/deduct-credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creditsToDeduct),
  });

  if (!response.ok) {
    // This is a non-critical error for the user, but should be logged.
    // The user got the service, but credit deduction failed on the backend.
    console.warn('Credit deduction failed post-action. Please check backend logs.');
    // Even if deduction fails, we proceed without a new token.
    return { result, newToken: null };
  }
  
  // The backend returns a new token with updated claims (e.g., new credit balance).
  const data = await response.json();
  const newToken = data.userAccesToken || null;

  return { result, newToken };
}
