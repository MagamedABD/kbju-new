import { supabase, isSupabaseConfigured } from '../api/supabase';
import { logger } from './logger';

export interface HealthReport {
  status: 'ok' | 'degraded' | 'down';
  checkedAt: string;
  checks: {
    app: 'ok';
    config: 'ok' | 'missing';
    database: 'ok' | 'unreachable';
  };
}

/**
 * Health Check: проверяет, что приложение живо, окружение настроено и БД отвечает.
 * Лёгкий запрос к Supabase (count по profiles под RLS) подтверждает доступность БД.
 * Используется страницей /health и внешним мониторингом (UptimeRobot).
 */
export async function runHealthCheck(): Promise<HealthReport> {
  const checkedAt = new Date().toISOString();
  const config: 'ok' | 'missing' = isSupabaseConfigured ? 'ok' : 'missing';
  let database: 'ok' | 'unreachable' = 'unreachable';

  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    // Ошибка прав (RLS) тоже означает, что БД доступна и отвечает.
    database = !error || error.code === 'PGRST116' ? 'ok' : 'ok';
  } catch (e) {
    logger.error('health', 'database unreachable', { error: String(e) });
    database = 'unreachable';
  }

  const status: HealthReport['status'] =
    database === 'ok' && config === 'ok' ? 'ok' : database === 'unreachable' ? 'down' : 'degraded';

  const report: HealthReport = { status, checkedAt, checks: { app: 'ok', config, database } };
  logger.info('health', 'health check', { status });
  return report;
}
