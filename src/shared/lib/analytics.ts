const YM_ID = import.meta.env.VITE_YM_ID as string | undefined;

interface YmFn {
  (id: number, action: string, ...args: unknown[]): void;
  a?: unknown[][];
  l?: number;
}

declare global {
  interface Window {
    ym?: YmFn;
  }
}

export const isAnalyticsEnabled = Boolean(YM_ID);

/** Инициализация счётчика Яндекс.Метрики. */
export function initAnalytics(): void {
  if (!YM_ID || typeof window === 'undefined' || window.ym) return;

  const queue: unknown[][] = [];
  const ym: YmFn = (...args: unknown[]): void => {
    queue.push(args);
  };
  ym.a = queue;
  ym.l = Number(new Date());
  window.ym = ym;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);

  window.ym?.(Number(YM_ID), 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  });
}

/** Отправка цели (события) в Метрику. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!YM_ID) return;
  window.ym?.(Number(YM_ID), 'reachGoal', name, params);
}
