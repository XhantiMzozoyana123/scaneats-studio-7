
import type { IMealRepository } from '../application/meal.repository';
import type { ScannedFood } from '@/app/domain/scanned-food';
import { API_BASE_URL } from '@/app/shared/lib/api';

export class MealApiRepository implements IMealRepository {
  async getLastMealPlan(token: string): Promise<ScannedFood | null> {
    console.log('MealApiRepository: Fetching last meal plan...');
    const response = await fetch(`${API_BASE_URL}/api/meal`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`MealApiRepository: Received response with status ${response.status}`);

    if (response.status === 401) {
      console.error('MealApiRepository: Unauthorized (401). Session may have expired.');
      throw new Error('Session Expired');
    }

    if (response.status === 404 || response.status === 204) {
      console.log('MealApiRepository: No meal plan found (404/204). Returning null.');
      return null;
    }

    if (!response.ok) {
      console.error(`MealApiRepository: Non-OK response status: ${response.status}`);
      throw new Error('Failed to fetch meal plan');
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      console.log('MealApiRepository: Response content length is 0. Returning null.');
      return null;
    }

    try {
      const meal = await response.json();
      console.log('MealApiRepository: Parsed meal data:', meal);
      return meal;
    } catch (e) {
      console.error('MealApiRepository: Failed to parse meal plan response JSON.', e);
      return null;
    }
  }
}
