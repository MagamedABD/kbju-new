import { useEffect, useState } from 'react';
import { runHealthCheck, type HealthReport } from '../shared/lib/health';

/**
 * Страница /health — отдаёт JSON-подобный статус приложения и БД.
 * Внешний мониторинг (UptimeRobot) опрашивает её и шлёт алерт при status !== ok.
 */
export function HealthPage() {
  const [report, setReport] = useState<HealthReport | null>(null);

  useEffect(() => {
    void runHealthCheck().then(setReport);
  }, []);

  if (!report) return <pre style={{ padding: 16 }}>checking…</pre>;

  const color =
    report.status === 'ok' ? '#12a37f' : report.status === 'degraded' ? '#e0a020' : '#d64545';

  return (
    <pre
      data-testid="health-report"
      style={{
        padding: 16,
        fontFamily: 'monospace',
        color,
        background: '#0f1830',
        minHeight: '100vh',
      }}
    >
      {JSON.stringify(report, null, 2)}
    </pre>
  );
}
