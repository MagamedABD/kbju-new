import type { Nutrients } from '../product/products';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🥣',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
};

export interface DiaryEntry {
  id: string;
  meal: MealType;
  productId: string;
  productName: string;
  grams: number;
  nutrients: Nutrients;
}

const EMPTY: Nutrients = { calories: 0, protein: 0, fat: 0, carbs: 0 };

/** Суммирует КБЖУ по набору записей. */
export function sumNutrients(entries: DiaryEntry[]): Nutrients {
  return entries.reduce<Nutrients>(
    (acc, e) => ({
      calories: acc.calories + e.nutrients.calories,
      protein: Math.round((acc.protein + e.nutrients.protein) * 10) / 10,
      fat: Math.round((acc.fat + e.nutrients.fat) * 10) / 10,
      carbs: Math.round((acc.carbs + e.nutrients.carbs) * 10) / 10,
    }),
    { ...EMPTY },
  );
}

/** Записи конкретного приёма пищи. */
export function entriesByMeal(entries: DiaryEntry[], meal: MealType): DiaryEntry[] {
  return entries.filter((e) => e.meal === meal);
}
