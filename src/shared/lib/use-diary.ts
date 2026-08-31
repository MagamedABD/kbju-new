import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { logError, toUserMessage } from '../api/api-error';
import type { DiaryEntry } from '../../entities/diary/diary';

interface EntryRow {
  id: string;
  meal: DiaryEntry['meal'];
  product_id: string;
  product_name: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const rowToEntry = (r: EntryRow): DiaryEntry => ({
  id: r.id,
  meal: r.meal,
  productId: r.product_id,
  productName: r.product_name,
  grams: Number(r.grams),
  nutrients: {
    calories: Number(r.calories),
    protein: Number(r.protein),
    fat: Number(r.fat),
    carbs: Number(r.carbs),
  },
});

const todayIso = (): string => new Date().toISOString().slice(0, 10);

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
  addEntry: (entry: DiaryEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

/**
 * CRUD записей дневника за сегодня для текущего пользователя.
 * Операции идут через авто REST API Supabase (PostgREST) под RLS.
 */
export function useDiary(userId: string | undefined): DiaryState {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', todayIso())
      .order('created_at', { ascending: true });

    if (err) {
      logError('diary:load', err);
      setError(toUserMessage(err));
    } else {
      setEntries((data as EntryRow[]).map(rowToEntry));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: DiaryEntry): Promise<void> => {
      if (!userId) return;
      // id и entry_date проставляет БД; клиентский id из формы игнорируем.
      const { data, error: err } = await supabase
        .from('diary_entries')
        .insert({
          user_id: userId,
          meal: entry.meal,
          product_id: entry.productId,
          product_name: entry.productName,
          grams: entry.grams,
          calories: entry.nutrients.calories,
          protein: entry.nutrients.protein,
          fat: entry.nutrients.fat,
          carbs: entry.nutrients.carbs,
        })
        .select()
        .single();

      if (err) {
        logError('diary:add', err);
        throw err;
      }
      setEntries((prev) => [...prev, rowToEntry(data as EntryRow)]);
    },
    [userId],
  );

  const removeEntry = useCallback(
    async (id: string): Promise<void> => {
      const prev = entries;
      // Оптимистичное удаление: убираем сразу, при ошибке возвращаем.
      setEntries((list) => list.filter((e) => e.id !== id));
      const { error: err } = await supabase.from('diary_entries').delete().eq('id', id);
      if (err) {
        logError('diary:remove', err);
        setEntries(prev);
        throw err;
      }
    },
    [entries],
  );

  return { entries, loading, error, addEntry, removeEntry };
}
