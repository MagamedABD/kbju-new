export interface Product {
  id: string;
  name: string;
  /** КБЖУ на 100 г. */
  per100: { calories: number; protein: number; fat: number; carbs: number };
  /** Вес одной штуки в граммах, если продукт штучный. */
  pieceGrams?: number;
}

/** Mock-база продуктов (в реальном продукте — запрос к каталогу). */
export const PRODUCTS: Product[] = [
  {
    id: 'oat',
    name: 'Овсяная каша на воде',
    per100: { calories: 88, protein: 3, fat: 1.7, carbs: 15 },
  },
  {
    id: 'chicken',
    name: 'Куриная грудка отварная',
    per100: { calories: 137, protein: 29, fat: 1.8, carbs: 0 },
  },
  {
    id: 'buckwheat',
    name: 'Гречка отварная',
    per100: { calories: 132, protein: 4.5, fat: 2.3, carbs: 25 },
  },
  {
    id: 'rice',
    name: 'Рис белый отварной',
    per100: { calories: 116, protein: 2.2, fat: 0.5, carbs: 25 },
  },
  {
    id: 'egg',
    name: 'Яйцо куриное',
    per100: { calories: 157, protein: 12.7, fat: 11.5, carbs: 0.7 },
    pieceGrams: 55,
  },
  {
    id: 'banana',
    name: 'Банан',
    per100: { calories: 96, protein: 1.5, fat: 0.2, carbs: 21 },
    pieceGrams: 120,
  },
  {
    id: 'apple',
    name: 'Яблоко',
    per100: { calories: 52, protein: 0.4, fat: 0.4, carbs: 14 },
    pieceGrams: 150,
  },
  { id: 'cottage', name: 'Творог 5%', per100: { calories: 121, protein: 17, fat: 5, carbs: 3 } },
  {
    id: 'salmon',
    name: 'Лосось запечённый',
    per100: { calories: 208, protein: 20, fat: 13, carbs: 0 },
  },
  { id: 'almond', name: 'Миндаль', per100: { calories: 609, protein: 18.6, fat: 53.7, carbs: 13 } },
  {
    id: 'bread',
    name: 'Хлеб цельнозерновой',
    per100: { calories: 229, protein: 8, fat: 3, carbs: 43 },
  },
  {
    id: 'yogurt',
    name: 'Йогурт натуральный 3.2%',
    per100: { calories: 66, protein: 5, fat: 3.2, carbs: 4 },
  },
  {
    id: 'salad',
    name: 'Овощной салат с маслом',
    per100: { calories: 92, protein: 1.2, fat: 7, carbs: 5 },
  },
  {
    id: 'coffee',
    name: 'Кофе с молоком без сахара',
    per100: { calories: 37, protein: 2, fat: 2, carbs: 3 },
  },
];

/** Поиск продуктов по подстроке (регистронезависимо). */
export function searchProducts(query: string, source: Product[] = PRODUCTS): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return source.filter((p) => p.name.toLowerCase().includes(q));
}

export interface Nutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/** Пересчёт КБЖУ продукта под конкретную порцию в граммах. */
export function nutrientsForPortion(product: Product, grams: number): Nutrients {
  const k = grams / 100;
  const round = (n: number): number => Math.round(n * k * 10) / 10;
  return {
    calories: Math.round(product.per100.calories * k),
    protein: round(product.per100.protein),
    fat: round(product.per100.fat),
    carbs: round(product.per100.carbs),
  };
}
