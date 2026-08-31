# Backend-документация приложения «КБЖУ»

Документ покрывает Шаг 9 задания: архитектура, развёртывание, описание API, примеры запросов и процесс разработки с AI.

---

## 1. Архитектура решения

```
┌──────────────┐      HTTPS / supabase-js      ┌────────────────────────┐
│  Frontend    │  ─────────────────────────▶   │        Supabase        │
│ React + Vite │                                │                        │
│  (Vercel)    │   auth: JWT в заголовке        │  Auth  (email/пароль)  │
│              │  ◀─────────────────────────    │  PostgREST (REST API)  │
└──────────────┘        JSON + RLS              │  PostgreSQL + RLS      │
                                                │  Logs                  │
                                                └────────────────────────┘
```

**Выбор инфраструктуры — Supabase (Вариант A, BaaS).**
Обоснование: приложению нужны Postgres, аутентификация, разграничение доступа по пользователю и REST API. Supabase даёт всё это из коробки: авто-REST поверх таблиц (PostgREST), встроенный Auth с JWT и Row Level Security на уровне БД. Для учебного проекта это быстрее и надёжнее, чем поднимать PostgreSQL в Docker на VPS, настраивать PostgREST, сертификаты и бэкапы вручную. Self-hosted-вариант (PostgreSQL в Docker) оправдан при требовании держать данные на своей инфраструктуре — здесь такого требования нет.

**Слои приложения** (Feature-Sliced Design):
- `entities/` — чистая доменная логика (расчёт нормы, агрегация КБЖУ), без сети.
- `shared/api/` — клиент Supabase, маппинг ошибок.
- `shared/lib/` — хуки данных: `use-auth`, `use-profile`, `use-diary`.
- `features/`, `pages/` — UI.

## 2. Схема базы данных

Две таблицы, обе привязаны к `auth.users` (пользователи Supabase Auth).

**`profiles`** — один профиль на пользователя (параметры для расчёта нормы):
`id` (uuid, PK → auth.users), `sex`, `age`, `height_cm`, `weight_kg`, `activity`, `goal`, `created_at`, `updated_at`. На все поля — CHECK-ограничения (диапазоны возраста, роста, веса; допустимые значения enum-полей).

**`diary_entries`** — записи дневника (много на пользователя):
`id` (uuid, PK), `user_id` (→ auth.users), `entry_date`, `meal`, `product_id`, `product_name`, `grams`, `calories`, `protein`, `fat`, `carbs`, `created_at`. КБЖУ денормализованы в запись, чтобы правки справочника продуктов не меняли историю задним числом. Индекс `(user_id, entry_date)` под основной запрос.

Полная схема, триггер `updated_at` и RLS-политики — в `supabase/migrations/0001_init.sql`.

## 3. Безопасность

- **Аутентификация** — Supabase Auth, email + пароль, JWT в каждом запросе.
- **Row Level Security** включён на обеих таблицах. Политики: пользователь видит и изменяет только строки, где `auth.uid()` совпадает с `id`/`user_id` (SELECT/INSERT/UPDATE/DELETE). Доступ к чужим данным невозможен даже при прямом обращении к API.
- **Секреты.** Во фронтенде используется только публичный `anon`-ключ — он безопасен, так как доступ ограничивает RLS, а не секретность ключа. Ключи вынесены в переменные окружения (`.env`, не в коде; шаблон — `.env.example`). Сервисный `service_role`-ключ во фронтенд не попадает.
- **CORS.** Supabase по умолчанию разрешает запросы с любого origin к REST API под anon-ключом; ограничение доступа обеспечивает RLS. Домены фронтенда (Vercel) дополнительно указываются в Auth → URL Configuration для редиректов.

## 4. Описание API (endpoints)

API — авто-REST Supabase (PostgREST), вызовы идут через `supabase-js`. Базовый URL: `https://<project-ref>.supabase.co/rest/v1`. Во всех запросах — заголовки `apikey` и `Authorization: Bearer <JWT>`.

Реализованные операции (более 3 CRUD):

| # | Операция | Таблица | Метод (REST) | Где в коде |
|---|---|---|---|---|
| 1 | Создать/обновить профиль | profiles | `POST` (upsert) | `use-profile.ts` |
| 2 | Прочитать профиль | profiles | `GET ?id=eq.<uid>` | `use-profile.ts` |
| 3 | Добавить запись дневника | diary_entries | `POST` | `use-diary.ts` |
| 4 | Прочитать записи за день | diary_entries | `GET ?user_id=eq.<uid>&entry_date=eq.<date>` | `use-diary.ts` |
| 5 | Удалить запись | diary_entries | `DELETE ?id=eq.<id>` | `use-diary.ts` |
| — | Регистрация / вход / выход | auth.users | Supabase Auth | `use-auth.ts` |

## 5. Примеры запросов

**Регистрация (supabase-js):**
```ts
await supabase.auth.signUp({ email, password });
```

**Чтение записей дневника за сегодня:**
```ts
const { data, error } = await supabase
  .from('diary_entries')
  .select('*')
  .eq('user_id', userId)
  .eq('entry_date', '2026-09-01')
  .order('created_at', { ascending: true });
```

**Добавление записи:**
```ts
await supabase.from('diary_entries').insert({
  user_id: userId, meal: 'lunch',
  product_id: 'chicken', product_name: 'Куриная грудка',
  grams: 150, calories: 206, protein: 44, fat: 3, carbs: 0,
});
```

**Тот же вызов «сырым» REST (curl):**
```bash
curl -X POST 'https://<ref>.supabase.co/rest/v1/diary_entries' \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<uid>","meal":"lunch","product_id":"chicken",
       "product_name":"Куриная грудка","grams":150,
       "calories":206,"protein":44,"fat":3,"carbs":0}'
```

## 6. Обработка ошибок и логирование

- Сетевые и серверные ошибки (400/401/403/404/409/429/500/503) и коды Supabase Auth приводятся к понятным русским сообщениям в `shared/api/api-error.ts` (`toUserMessage`) — покрыто юнит-тестами.
- Ошибки не роняют UI: экраны показывают сообщение (`role="alert"`), удаление записи — оптимистичное с откатом при ошибке.
- Логирование — через `logError(scope, error)`; в Supabase запросы и ошибки также видны в разделе **Logs**. Для self-hosted точка логирования заменяется на отправку в лог-сервис.

## 7. Развёртывание

### Backend (Supabase)
1. Создать проект на supabase.com.
2. **SQL Editor** → выполнить `supabase/migrations/0001_init.sql` (создаст таблицы, RLS, триггеры).
3. **Authentication → Providers** → включить Email. Для быстрой проверки можно отключить «Confirm email».
4. **Project Settings → API** → скопировать `Project URL` и `anon public` ключ.

### Frontend
1. Заполнить `.env` по образцу `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. Локально: `npm install && npm run dev`.
3. Прод (Vercel): те же две переменные добавить в **Settings → Environment Variables**, затем Redeploy.

### Self-hosted (альтернатива, кратко)
`docker compose up` с образом `supabase/postgres` или `postgres:16` + `postgrest/postgrest`, переменные окружения — в `.env`. Схему применить той же миграцией.

## 8. Процесс разработки с AI

- **Проектирование БД.** Схема сгенерирована по описанию сущностей из ТЗ (профиль + записи дневника), затем вручную выверены типы, CHECK-ограничения и денормализация КБЖУ.
- **RLS и SQL.** Политики доступа сгенерированы по требованию «каждый видит только свои данные» и проверены на все четыре операции.
- **Код API-слоя.** Хуки `use-profile`/`use-diary` сгенерированы по RTCF-шаблону из ДЗ 2, с маппингом snake_case ↔ camelCase и обработкой ошибок.
- **Отладка.** Ошибки типов (`import.meta.env`) и вывод тестов передавались AI для точечных правок; каждое исправление закреплялось тестом.

## 9. Подтверждение работоспособности

```
npm run build →  tsc без ошибок; vite build: 91 modules, OK
npm test      →  Test Files 5 passed · Tests 26 passed
```

End-to-end проверяется после подстановки ключей Supabase: регистрация → онбординг (профиль сохраняется в `profiles`) → добавление продукта (запись в `diary_entries`) → перезагрузка страницы (данные грузятся с сервера) → выход.
