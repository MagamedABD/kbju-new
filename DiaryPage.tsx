import { useState } from 'react';
import type { DailyNorm } from '../entities/nutrition/types';
import { sumNutrients, type DiaryEntry, type MealType } from '../entities/diary/diary';
import { CalorieRing } from '../shared/ui/CalorieRing';
import { MacroBar } from '../shared/ui/MacroBar';
import { MealList } from '../features/diary-day/MealList';
import { FoodSearch } from '../features/food-search/FoodSearch';

interface DiaryPageProps {
  norm: DailyNorm;
  entries: DiaryEntry[];
  onAddEntry: (entry: DiaryEntry) => void;
  onRemoveEntry: (id: string) => void;
  onEditGoal: () => void;
  onSignOut?: () => void;
}

const todayLabel = (): string =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(),
  );

export function DiaryPage({
  norm,
  entries,
  onAddEntry,
  onRemoveEntry,
  onEditGoal,
  onSignOut,
}: DiaryPageProps) {
  const [openMeal, setOpenMeal] = useState<MealType | null>(null);
  const total = sumNutrients(entries);
  const remaining = Math.max(norm.calories - total.calories, 0);
  const over = total.calories > norm.calories;

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-10 pt-8">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Сегодня</div>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight" data-testid="remaining-heading">
          {over
            ? `Превышение на ${total.calories - norm.calories} ккал`
            : `Осталось ${remaining} ккал`}
        </h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted">
          <button type="button" onClick={onEditGoal} className="underline-offset-2 hover:underline">
            {todayLabel()} · изменить цель
          </button>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="ml-auto underline-offset-2 hover:underline"
            >
              Выйти
            </button>
          )}
        </div>
      </header>

      {norm.cappedToSafeMinimum && (
        <div
          className="mb-4 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn"
          role="note"
        >
          Норма ограничена безопасным минимумом. Слишком низкая калорийность вредна — при цели
          сильно снизить вес имеет смысл обсудить план со специалистом.
        </div>
      )}

      <div className="mb-4 rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <CalorieRing consumed={total.calories} target={norm.calories} />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <MacroBar label="Белки" value={total.protein} target={norm.protein} color="#3f7d5a" />
        <MacroBar label="Жиры" value={total.fat} target={norm.fat} color="#c8a24a" />
        <MacroBar label="Углеводы" value={total.carbs} target={norm.carbs} color="#5a7fb0" />
      </div>

      <h2 className="mb-3 px-1 text-sm font-semibold">Приёмы пищи</h2>
      <MealList entries={entries} onAddClick={setOpenMeal} onRemove={onRemoveEntry} />

      {openMeal && (
        <FoodSearch meal={openMeal} onAdd={onAddEntry} onClose={() => setOpenMeal(null)} />
      )}
    </div>
  );
}
