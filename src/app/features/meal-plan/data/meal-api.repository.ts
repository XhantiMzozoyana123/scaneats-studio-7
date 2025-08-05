
import type { IMealRepository } from '../application/meal.repository';
import type { ScannedFood } from '@/app/domain/scanned-food';
import { API_BASE_URL } from '@/app/shared/lib/api';

export class MealApiRepository implements IMealRepository {
  async getLastMealPlan(token: string): Promise<ScannedFood | null> {
    const response = await fetch(`${API_BASE_URL}/api/meal`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Session Expired');
    }

    // Handle cases where no meal plan is found, which is not an error.
    if (response.status === 404 || response.status === 204) {
      return null;
    }

    if (!response.ok) {
      // For other non-successful responses, throw a generic error.
      throw new Error('Failed to fetch meal plan');
    }

    // Check if the response has content before trying to parse it.
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    try {
      const meal = await response.json();
      // If the API returns an empty object or an object without an ID, treat it as null.
      if (!meal || !meal.id) {
        return null;
      }
      return meal;
    } catch (e) {
      // If JSON parsing fails on a successful response, it might be an issue.
      console.error('Failed to parse meal plan response', e);
      // Depending on requirements, you might want to throw an error or return null.
      // Returning null to avoid breaking the UI for now.
      return null;
    }
  }
}
