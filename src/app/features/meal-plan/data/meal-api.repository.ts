
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

      const meal = await response.json();
      // The controller returns a list, we take the first element.
      return meal && meal.length > 0 ? meal[0] : null;
    } catch (error) {
      console.error('Error fetching last meal plan:', error);
      throw error;
    }
  }
}
