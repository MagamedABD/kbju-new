import { describe, expect, it } from 'vitest';
import { calcBmr, calcDailyNorm, validateParams } from './calc';
import type { UserParams } from './types';

const base: UserParams = {
  sex: 'male',
  age: 30,
  heightCm: 180,
  weightKg: 80,
  activity: 'medium',
  goal: 'maintain',
};

describe('calcBmr — формула Миффлина–Сан Жеора', () => {
  it('считает базовый обмен для мужчины', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 1780
    expect(calcBmr(base)).toBe(1780);
  });

  it('для женщины константа на 166 меньше, чем для мужчины', () => {
    const male = calcBmr({ ...base, sex: 'male' });
    const female = calcBmr({ ...base, sex: 'female' });
    expect(male - female).toBe(166);
  });
});

describe('calcDailyNorm', () => {
  it('норма поддержания выше базового обмена за счёт активности', () => {
    const norm = calcDailyNorm(base);
    expect(norm.calories).toBeGreaterThan(calcBmr(base));
    expect(norm.cappedToSafeMinimum).toBe(false);
  });

  it('цель «похудение» даёт меньше калорий, чем «поддержание»', () => {
    const maintain = calcDailyNorm({ ...base, goal: 'maintain' }).calories;
    const lose = calcDailyNorm({ ...base, goal: 'lose' }).calories;
    expect(lose).toBeLessThan(maintain);
  });

  it('раскладка макросов согласуется с калорийностью (±3%)', () => {
    const n = calcDailyNorm(base);
    const fromMacros = n.protein * 4 + n.fat * 9 + n.carbs * 4;
    expect(Math.abs(fromMacros - n.calories) / n.calories).toBeLessThan(0.03);
  });

  it('ОБРАБОТКА КРАЯ: норма не опускается ниже безопасного минимума и ставит флаг', () => {
    // Маленькая худая женщина с целью похудеть — расчётная норма ниже 1200.
    const norm = calcDailyNorm({
      sex: 'female',
      age: 60,
      heightCm: 150,
      weightKg: 45,
      activity: 'minimal',
      goal: 'lose',
    });
    expect(norm.calories).toBe(1200);
    expect(norm.cappedToSafeMinimum).toBe(true);
  });
});

describe('validateParams', () => {
  it('пропускает корректные значения', () => {
    expect(validateParams({ age: 30, heightCm: 180, weightKg: 80 }).valid).toBe(true);
  });

  it('ОБРАБОТКА КРАЯ: помечает пустые поля ошибками', () => {
    const r = validateParams({ age: null, heightCm: 180, weightKg: 80 });
    expect(r.valid).toBe(false);
    expect(r.errors.age).toBeTruthy();
  });

  it('ОБРАБОТКА КРАЯ: отклоняет значения вне допустимого диапазона', () => {
    const r = validateParams({ age: 5, heightCm: 180, weightKg: 80 });
    expect(r.valid).toBe(false);
    expect(r.errors.age).toBeTruthy();
  });
});
