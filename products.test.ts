import { describe, expect, it } from 'vitest';
import { nutrientsForPortion, searchProducts, type Product } from './products';

const chicken: Product = {
  id: 'chicken',
  name: 'Куриная грудка отварная',
  per100: { calories: 137, protein: 29, fat: 1.8, carbs: 0 },
};

describe('searchProducts', () => {
  it('находит продукт по подстроке без учёта регистра', () => {
    const res = searchProducts('куриная');
    expect(res.some((p) => p.id === 'chicken')).toBe(true);
  });

  it('ОБРАБОТКА КРАЯ: возвращает пусто для запроса короче 2 символов', () => {
    expect(searchProducts('к')).toEqual([]);
  });

  it('ОБРАБОТКА КРАЯ: возвращает пусто, когда ничего не найдено', () => {
    expect(searchProducts('несуществующийпродукт')).toEqual([]);
  });
});

describe('nutrientsForPortion', () => {
  it('пересчитывает КБЖУ пропорционально порции', () => {
    const n = nutrientsForPortion(chicken, 150);
    expect(n.calories).toBe(206); // 137 * 1.5 = 205.5 -> 206
    expect(n.protein).toBeCloseTo(43.5, 1);
  });

  it('на 100 г возвращает исходные значения', () => {
    const n = nutrientsForPortion(chicken, 100);
    expect(n.calories).toBe(137);
    expect(n.protein).toBeCloseTo(29, 1);
  });
});
