
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

    if (!response.ok) {
      // If the response is not OK, but not a 404 (not found), throw an error
      if (response.status !== 404) {
        throw new Error('Failed to fetch meal plan');
      }
      // For 404, we return null, as it means no meal plan was found.
      return null;
    }

    // Check if the response has content
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
        return null;
    }

    try {
      const meal = await response.json();
      // If the API returns an empty object or an object without an ID, treat it as null
      if (!meal || !meal.id) {
          return null;
      }
      return meal;
    } catch (e) {
      // If JSON parsing fails, it's likely an empty response
      console.error('Failed to parse meal plan response', e);
      return null;
    }
  }
}
