/**
 * Структурное логирование в JSON с уровнями.
 * В браузере пишет в консоль; формат JSON позволяет централизованно
 * собирать и фильтровать логи (Vercel Logs, внешний лог-сервис).
 */

export type LogLevel = 'info' | 'warn' | 'error';

interface LogRecord {
  ts: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta?: Record<string, unknown>;
}

function emit(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const record: LogRecord = { ts: new Date().toISOString(), level, scope, message };
  if (meta) record.meta = meta;

  const line = JSON.stringify(record);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (scope: string, message: string, meta?: Record<string, unknown>) =>
    emit('info', scope, message, meta),
  warn: (scope: string, message: string, meta?: Record<string, unknown>) =>
    emit('warn', scope, message, meta),
  error: (scope: string, message: string, meta?: Record<string, unknown>) =>
    emit('error', scope, message, meta),
};
