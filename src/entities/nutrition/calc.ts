import {
  ACTIVITY_FACTORS,
  PARAM_LIMITS,
  SAFE_MINIMUM_CALORIES,
  type DailyNorm,
  type Goal,
  type UserParams,
} from './types';

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -0.15,
  maintain: 0,
  gain: 0.1,
};

// Раскладка макросов: белки/жиры/углеводы от калорийности.
const MACRO_SPLIT = { protein: 0.3, fat: 0.3, carbs: 0.4 };

// Калорийность 1 г нутриента.
const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 };

/**
 * Базовый обмен по формуле Миффлина–Сан Жеора.
 * Для мужчин константа +5, для женщин −161.
 */
export function calcBmr(params: UserParams): number {
  const { weightKg, heightCm, age, sex } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Дневная норма КБЖУ. Норма не опускается ниже безопасного минимума —
 * показ слишком низкой калорийности вреден, поэтому значение ограничивается,
 * а факт ограничения возвращается флагом для предупреждения в UI.
 */
export function calcDailyNorm(params: UserParams): DailyNorm {
  const bmr = calcBmr(params);
  const maintenance = bmr * ACTIVITY_FACTORS[params.activity];
  const target = maintenance * (1 + GOAL_ADJUSTMENT[params.goal]);

  const safeMin = SAFE_MINIMUM_CALORIES[params.sex];
  const cappedToSafeMinimum = target < safeMin;
  const calories = Math.round(Math.max(target, safeMin));

  return {
    calories,
    protein: Math.round((calories * MACRO_SPLIT.protein) / KCAL_PER_GRAM.protein),
    fat: Math.round((calories * MACRO_SPLIT.fat) / KCAL_PER_GRAM.fat),
    carbs: Math.round((calories * MACRO_SPLIT.carbs) / KCAL_PER_GRAM.carbs),
    cappedToSafeMinimum,
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof UserParams, string>>;
}

/** Проверка параметров онбординга. Возвращает ошибки по полям. */
export function validateParams(params: {
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
}): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const check = (
    key: 'age' | 'heightCm' | 'weightKg',
    value: number | null,
    label: string,
  ): void => {
    if (value === null || Number.isNaN(value)) {
      errors[key] = `Укажите ${label}`;
      return;
    }
    const { min, max } = PARAM_LIMITS[key];
    if (value < min || value > max) {
      errors[key] = `Допустимо от ${min} до ${max}`;
    }
  };

  check('age', params.age, 'возраст');
  check('heightCm', params.heightCm, 'рост');
  check('weightKg', params.weightKg, 'вес');

  return { valid: Object.keys(errors).length === 0, errors };
}
