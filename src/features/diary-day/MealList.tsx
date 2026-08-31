import {
  MEAL_ICONS,
  MEAL_LABELS,
  MEAL_ORDER,
  entriesByMeal,
  sumNutrients,
  type DiaryEntry,
  type MealType,
} from '../../entities/diary/diary';

interface MealListProps {
  entries: DiaryEntry[];
  onAddClick: (meal: MealType) => void;
  onRemove: (id: string) => void;
}

export function MealList({ entries, onAddClick, onRemove }: MealListProps) {
  return (
    <div className="space-y-3">
      {MEAL_ORDER.map((meal) => {
        const mealEntries = entriesByMeal(entries, meal);
        const total = sumNutrients(mealEntries);

        return (
          <div key={meal} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg">
                {MEAL_ICONS[meal]}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{MEAL_LABELS[meal]}</div>
                <div className="text-[13px] text-muted">
                  {mealEntries.length === 0 ? 'пока пусто' : `${total.calories} ккал`}
                </div>
              </div>
              <button
                type="button"
                data-testid={`add-${meal}`}
                onClick={() => onAddClick(meal)}
                aria-label={`Добавить в ${MEAL_LABELS[meal]}`}
                className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand"
              >
                ＋
              </button>
            </div>

            {mealEntries.length > 0 && (
              <ul className="mt-3 space-y-2 border-t border-line pt-3">
                {mealEntries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate">
                      {e.productName}
                      <span className="text-muted"> · {e.grams} г</span>
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-3">
                      <span className="font-semibold">{e.nutrients.calories} ккал</span>
                      <button
                        type="button"
                        data-testid={`remove-${e.id}`}
                        onClick={() => onRemove(e.id)}
                        aria-label={`Удалить ${e.productName}`}
                        className="text-muted hover:text-warn"
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
