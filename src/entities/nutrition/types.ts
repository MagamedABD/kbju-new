export type Sex = 'male' | 'female';

export type ActivityLevel = 'minimal' | 'low' | 'medium' | 'high' | 'veryHigh';

export type Goal = 'lose' | 'maintain' | 'gain';

export interface UserParams {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}

/** Дневная норма: калории и макросы в граммах. */
export interface DailyNorm {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  /** true, если норма была ограничена безопасным минимумом. */
  cappedToSafeMinimum: boolean;
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  minimal: 1.2,
  low: 1.375,
  medium: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  minimal: 'Минимальная (сидячий образ жизни)',
  low: 'Низкая (1–2 тренировки в неделю)',
  medium: 'Средняя (3–4 тренировки)',
  high: 'Высокая (5–6 тренировок)',
  veryHigh: 'Очень высокая (спорт ежедневно)',
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Похудение',
  maintain: 'Поддержание',
  gain: 'Набор массы',
};

/** Безопасный минимум суточной калорийности (не опускаемся ниже). */
export const SAFE_MINIMUM_CALORIES: Record<Sex, number> = {
  male: 1500,
  female: 1200,
};

export const PARAM_LIMITS = {
  age: { min: 14, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 35, max: 300 },
} as const;
