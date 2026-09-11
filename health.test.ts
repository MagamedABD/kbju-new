import { describe, expect, it, vi, beforeEach } from 'vitest';

// Мокаем клиент Supabase, чтобы проверить логику health без реальной сети.
vi.mock('../api/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ error: null, count: 0 }),
    }),
  },
}));

import { runHealthCheck } from './health';

describe('runHealthCheck', () => {
  beforeEach(() => vi.clearAllMocks());

  it('возвращает status ok при доступной БД и настроенном окружении', async () => {
    const report = await runHealthCheck();
    expect(report.status).toBe('ok');
    expect(report.checks.app).toBe('ok');
    expect(report.checks.database).toBe('ok');
  });

  it('в отчёте есть отметка времени', async () => {
    const report = await runHealthCheck();
    expect(report.checkedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
