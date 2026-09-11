import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { HealthPage } from './pages/HealthPage';
import { initAnalytics } from './shared/lib/analytics';
import './index.css';

// Инициализируем аналитику до рендера (безопасно без ключа — ничего не делает).
initAnalytics();

// Простейший роутинг без роутер-библиотеки: /health отдаёт статус для мониторинга,
// остальные пути — приложение.
const isHealth = window.location.pathname.replace(/\/$/, '') === '/health';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isHealth ? <HealthPage /> : <App />}</StrictMode>,
);
