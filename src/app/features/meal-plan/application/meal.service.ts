
import type { IMealRepository } from './meal.repository';
import type { ScannedFood } from '@/app/domain/scanned-food';

export class MealService {
  constructor(private mealRepository: IMealRepository) {}

  async getLastMealPlan(token: string): Promise<ScannedFood | null> {
    return this.mealRepository.getLastMealPlan(token);
  }
}
