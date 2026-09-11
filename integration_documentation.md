# Документация по интеграциям и инфраструктуре — «КБЖУ»

Покрывает Шаги 1, 3, 4, 6, 7, 9 задания: CI/CD, OAuth2, аналитика, мониторинг, логирование.

---

## 1. CI/CD (GitHub Actions)

**Платформа:** GitHub Actions. Конфигурация — `.github/workflows/ci.yml`.

**Триггеры:** push и pull request в ветку `main`.

**Джоб `quality` (ворота качества):**
1. checkout кода;
2. установка Node 20 + кэш npm;
3. `npm ci` — установка зависимостей;
4. `npm audit --omit=dev` — аудит production-зависимостей;
5. `npm run lint` — ESLint;
6. `npm run format:check` — проверка форматирования Prettier;
7. `npm run typecheck` — проверка типов TypeScript;
8. `npm test` — тесты Vitest;
9. `npm run build` — production-сборка.

**Джоб `deploy`:** запускается **только после успешного `quality`** (`needs: quality`) и только на push в `main`. Деплоит на Vercel через Vercel CLI (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`).

**Требуемые GitHub Secrets** (Settings → Secrets and variables → Actions):
- `VERCEL_TOKEN` — токен из Vercel (Account Settings → Tokens);
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_YM_ID` — для шага сборки.

**Проверки качества кода:** ESLint (`.eslintrc.cjs`, запрет `any`, правила hooks), Prettier (`.prettierrc.json`), `tsc --noEmit`.

Локальная проверка того же, что гоняет CI:
```bash
npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
```

---

## 2. OAuth2 — вход через Google

**Провайдер:** Google (OAuth2). Flow ведёт Supabase Auth — свой сервер поднимать не нужно.

**Код:** функция `signInWithGoogle()` в `src/shared/lib/use-auth.ts` вызывает `supabase.auth.signInWithOAuth({ provider: 'google' })`; кнопка «Войти через Google» — в `AuthForm.tsx`.

**Настройка (консоль провайдера + Supabase):**
1. **Google Cloud Console** → APIs & Services → Credentials → Create Credentials → OAuth client ID → тип **Web application**.
2. В **Authorized redirect URIs** добавить callback Supabase:
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. Скопировать **Client ID** и **Client Secret**.
4. **Supabase** → Authentication → Providers → **Google** → включить, вставить Client ID и Secret → Save.
5. **Supabase** → Authentication → URL Configuration → Site URL = адрес приложения на Vercel.

**Тестирование:** нажать «Войти через Google» → выбрать аккаунт → редирект обратно в приложение уже авторизованным. Пользователь появляется в Authentication → Users с провайдером Google. Ошибки (отказ в доступе, закрытое окно) обрабатываются `toUserMessage` и показываются на форме.

---

## 3. Аналитика — Яндекс.Метрика

**Код:** `src/shared/lib/analytics.ts` — `initAnalytics()` вставляет официальный скрипт Метрики, `trackEvent()` шлёт цели. Инициализация — в `main.tsx`. ID счётчика — из `VITE_YM_ID`; без ключа трекинг молча отключён (удобно для локали и тестов).

**Настройка:**
1. metrika.yandex.ru → создать счётчик, указать домен приложения на Vercel.
2. Скопировать **номер счётчика**.
3. Добавить `VITE_YM_ID=<номер>` в переменные окружения Vercel (и в GitHub Secrets для сборки в CI) → Redeploy.

**Отслеживаемые события (цели):**
| Событие | Когда шлётся |
|---|---|
| `sign_up` | успешная регистрация |
| `sign_in` | вход по email |
| `sign_in_google` | вход через Google |
| `norm_calculated` | рассчитана норма (с параметром цели) |
| `entry_added` | добавлен продукт в дневник (с типом приёма) |

**Тестирование:** открыть приложение с заданным `VITE_YM_ID`, выполнить действия → в отчётах Метрики (Вебвизор / Цели) появляются визиты и достижения целей.

---

## 4. Мониторинг

**Health Check endpoint:** страница `/health` (`src/pages/HealthPage.tsx`) отдаёт JSON-статус: состояние приложения, наличие конфигурации и доступность БД (лёгкий запрос к Supabase). Логика — `src/shared/lib/health.ts`, покрыта тестом.

Пример ответа:
```json
{
  "status": "ok",
  "checkedAt": "2026-09-01T10:00:00.000Z",
  "checks": { "app": "ok", "config": "ok", "database": "ok" }
}
```

**Внешний мониторинг (UptimeRobot):**
1. uptimerobot.com → Add New Monitor → тип **HTTP(s)**.
2. URL = `https://<app>.vercel.app/health`, интервал 5 минут.
3. Alert Contacts → email → приходит уведомление при недоступности.

**Встроенный мониторинг Vercel:** вкладки Deployments (статус сборок) и Logs (рантайм-логи и ошибки).

---

## 5. Логирование

**Структурное JSON-логирование** — `src/shared/lib/logger.ts`. Уровни `info / warn / error`, каждая запись — JSON с полями `ts`, `level`, `scope`, `message`, `meta`. Формат пригоден для централизованного сбора и фильтрации (Vercel Logs, внешний лог-сервис).

Пример записи:
```json
{"ts":"2026-09-01T10:00:00.000Z","level":"error","scope":"diary:add","message":"insert failed","meta":{"code":"PGRST301"}}
```

**Анализ логов с помощью AI.** Промпт для разбора:
> «Вот строки JSON-логов приложения. Сгруппируй по `scope` и `level`, найди повторяющиеся `error`, предположи причину и предложи, что проверить в первую очередь.»

Проверено на типовых ошибках: всплеск `scope:"diary:add"` с кодом PostgREST → указывает на проблему RLS/схемы; серия `scope:"health" status:"down"` → недоступность БД.

---

## 6. Переменные окружения (сводно)

| Переменная | Где | Назначение |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel, GitHub Secrets | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | Vercel, GitHub Secrets | публичный ключ Supabase |
| `VITE_YM_ID` | Vercel, GitHub Secrets | номер счётчика Метрики |
| `VERCEL_TOKEN` | GitHub Secrets | деплой из CI |

Шаблон — `.env.example`. Реальные значения в репозиторий не коммитятся.

---

## 7. Использование AI в процессе

- **CI/CD:** базовый workflow сгенерирован AI по описанию «этапы install → lint → format → typecheck → test → build, затем deploy на Vercel только после прохождения проверок», затем выверены имена скриптов и порядок джобов.
- **Аудит безопасности:** список проверок по OWASP Top-10 и оценка результатов `npm audit` (что prod, что dev) — с помощью AI; решение по accepted risk принято осознанно.
- **Анализ логов:** промпт для группировки и поиска причин (раздел 5) составлен и проверен на типовых ошибках.
- **Интеграции:** код обёрток Метрики, health-check и OAuth сгенерирован по RTCF-шаблонам из ДЗ 2 и приведён под правила `.cursorrules` (запрет `any`, вынос секретов).
