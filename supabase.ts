import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true, если переменные окружения заданы — иначе UI покажет подсказку по настройке. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Единый клиент Supabase. Если переменные не заданы (например, локально без .env),
 * создаём клиент с плейсхолдерами, чтобы сборка и импорт не падали, — реальные
 * вызовы вернут ошибку, которую перехватывает слой обработки ошибок.
 */
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
);
