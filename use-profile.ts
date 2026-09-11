import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { logError, toUserMessage } from '../api/api-error';
import { calcDailyNorm } from '../../entities/nutrition/calc';
import type { DailyNorm, UserParams } from '../../entities/nutrition/types';

interface ProfileRow {
  id: string;
  sex: UserParams['sex'];
  age: number;
  height_cm: number;
  weight_kg: number;
  activity: UserParams['activity'];
  goal: UserParams['goal'];
}

const rowToParams = (r: ProfileRow): UserParams => ({
  sex: r.sex,
  age: r.age,
  heightCm: r.height_cm,
  weightKg: Number(r.weight_kg),
  activity: r.activity,
  goal: r.goal,
});

interface ProfileState {
  params: UserParams | null;
  norm: DailyNorm | null;
  loading: boolean;
  error: string | null;
  saveProfile: (params: UserParams) => Promise<void>;
}

/**
 * Загружает профиль текущего пользователя и позволяет сохранить его (upsert).
 * Норма КБЖУ выводится из параметров чистой функцией, в БД не хранится.
 */
export function useProfile(userId: string | undefined): ProfileState {
  const [params, setParams] = useState<UserParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      // maybeSingle: профиля может ещё не быть — это не ошибка, а сигнал показать онбординг.
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!active) return;
      if (err) {
        logError('profile:load', err);
        setError(toUserMessage(err));
      } else {
        setParams(data ? rowToParams(data as ProfileRow) : null);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const saveProfile = useCallback(
    async (next: UserParams): Promise<void> => {
      if (!userId) return;
      const { error: err } = await supabase.from('profiles').upsert({
        id: userId,
        sex: next.sex,
        age: next.age,
        height_cm: next.heightCm,
        weight_kg: next.weightKg,
        activity: next.activity,
        goal: next.goal,
      });
      if (err) {
        logError('profile:save', err);
        throw err;
      }
      setParams(next);
    },
    [userId],
  );

  const norm = params ? calcDailyNorm(params) : null;

  return { params, norm, loading, error, saveProfile };
}
