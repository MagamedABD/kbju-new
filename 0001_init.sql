-- ============================================================
-- КБЖУ · миграция 0001 — схема БД, RLS-политики, триггеры
-- Применяется в Supabase → SQL Editor (или через supabase db push)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Таблица профилей: один профиль на пользователя.
--    id ссылается на встроенную таблицу auth.users (Supabase Auth).
--    Хранит параметры пользователя; норма КБЖУ считается на клиенте
--    из этих параметров, поэтому в БД не дублируется.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  sex         text        not null check (sex in ('male', 'female')),
  age         int         not null check (age between 14 and 100),
  height_cm   int         not null check (height_cm between 120 and 230),
  weight_kg   numeric(5,1) not null check (weight_kg between 35 and 300),
  activity    text        not null check (activity in ('minimal','low','medium','high','veryHigh')),
  goal        text        not null check (goal in ('lose','maintain','gain')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Таблица записей дневника: много записей на пользователя.
--    Денормализуем КБЖУ порции в саму запись — так дневник
--    не зависит от изменений в справочнике продуктов задним числом.
-- ------------------------------------------------------------
create table if not exists public.diary_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  entry_date   date        not null default current_date,
  meal         text        not null check (meal in ('breakfast','lunch','dinner','snack')),
  product_id   text        not null,
  product_name text        not null,
  grams        numeric(6,1) not null check (grams > 0),
  calories     numeric(7,1) not null check (calories >= 0),
  protein      numeric(6,1) not null check (protein  >= 0),
  fat          numeric(6,1) not null check (fat      >= 0),
  carbs        numeric(6,1) not null check (carbs    >= 0),
  created_at   timestamptz not null default now()
);

-- Индекс под основной запрос: записи пользователя за конкретный день.
create index if not exists diary_entries_user_date_idx
  on public.diary_entries (user_id, entry_date);

-- ------------------------------------------------------------
-- 3. Триггер обновления updated_at на profiles.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. Row Level Security — каждый видит и меняет только своё.
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.diary_entries  enable row level security;

-- --- profiles ---
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --- diary_entries ---
drop policy if exists "entries_select_own" on public.diary_entries;
create policy "entries_select_own"
  on public.diary_entries for select
  using (auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.diary_entries;
create policy "entries_insert_own"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.diary_entries;
create policy "entries_update_own"
  on public.diary_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.diary_entries;
create policy "entries_delete_own"
  on public.diary_entries for delete
  using (auth.uid() = user_id);
