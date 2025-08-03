
import type { ScannedFood } from '@/app/domain/scanned-food';

export interface IMealRepository {
  getLastMealPlan(token: string): Promise<ScannedFood | null>;
}
