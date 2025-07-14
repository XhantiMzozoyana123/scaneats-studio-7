
import { API_BASE_URL } from '@/lib/api';

async function checkSubscriptionStatus(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/event/subscription/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // If status check fails, assume not subscribed to be safe
    console.error('Subscription check failed:', response.status);
    return false;
  }
  const data = await response.json();
  return data.isSubscribed === true;
}

async function getRemainingCredits(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/event/credits/remaining`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // If credit check fails, assume 0 credits to be safe
    console.error('Credit check failed:', response.status);
    return 0;
  }
  const data = await response.json();
  return data.remainingCredits || 0;
}

async function deductCredits(token: string, amount: number): Promise<boolean> {
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

/**
 * Executes a protected action after verifying subscription and credit status.
 * Throws specific errors for the UI to handle.
 * @param action - The async function to execute if checks pass.
 * @param creditsToDeduct - The number of credits to deduct upon success.
 * @returns The result of the action function.
 */
export async function runProtectedAction<T>(
  action: () => Promise<T>,
  creditsToDeduct: number = 1
): Promise<T> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('AUTH_TOKEN_MISSING');
  }

  // 1. Check subscription status
  const isSubscribed = await checkSubscriptionStatus(token);
  if (!isSubscribed) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }

  // 2. Check remaining credits
  const remainingCredits = await getRemainingCredits(token);
  if (remainingCredits < creditsToDeduct) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  // 3. Execute the core function
  const result = await action();

  // 4. Deduct credits *after* the action is successful
  const deductionSuccess = await deductCredits(token, creditsToDeduct);
  if (!deductionSuccess) {
    // This is a non-critical error for the user, but should be logged.
    // The user got the service, but credit deduction failed on the backend.
    console.warn('Credit deduction failed post-action. Please check backend logs.');
  }

  return result;
}
