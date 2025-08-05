
import type { IMealRepository } from '../domain/meal.repository';
import type { ScannedFood } from '@/app/domain/scanned-food';
import { API_BASE_URL } from '@/app/shared/lib/api';

export class MealApiRepository implements IMealRepository {
  async getLastMealPlan(token: string): Promise<ScannedFood | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        return null; // No meal plan found, which is not an error
      }

      if (!response.ok) {
        throw new Error('Failed to fetch last meal plan');
      }

      const contentLength = response.headers.get('content-length');
      if (!contentLength || parseInt(contentLength, 10) === 0) {
        return null; // Handle empty response body
      }

      const meal = await response.json();
      // The controller now returns a single object.
      return meal;
    } catch (error) {
      console.error('Error fetching last meal plan:', error);
      throw error;
    }
  }
}
