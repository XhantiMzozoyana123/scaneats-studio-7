
'use server';

import { API_BASE_URL } from '@/lib/api';

/**
 * Deducts credits by calling the backend and returns a new token.
 * @param token - The user's current authentication token.
 * @param creditsToDeduct - The number of credits to deduct.
 * @returns An object containing the potentially new auth token.
 */
export async function deductCredits(
  token: string,
  creditsToDeduct = 1
): Promise<{ newToken: string | null }> {
  if (!token) {
    throw new Error('AUTH_TOKEN_MISSING');
  }

  const response = await fetch(`${API_BASE_URL}/api/event/deduct-credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creditsToDeduct),
  });

  if (!response.ok) {
    // If credit deduction fails, log it but don't fail the user's action
    // as they have already received the AI response.
    console.warn('Credit deduction failed post-action. Please check backend logs.');
    
    if (response.status === 429) {
      // Specifically handle the case where the user is out of credits
      throw new Error('INSUFFICIENT_CREDITS');
    }
    
    // For other errors, we can proceed without a new token.
    return { newToken: null };
  }
  
  // The backend should return a new token with updated claims (e.g., new credit balance).
  const data = await response.json();
  const newToken = data.userAccesToken || null;

  return { newToken };
}
