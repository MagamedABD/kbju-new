import { useMemo, useState } from 'react';
import {
  nutrientsForPortion,
  searchProducts,
  type Product,
} from '../../entities/product/products';
import { MEAL_LABELS, type DiaryEntry, type MealType } from '../../entities/diary/diary';
import { cn } from '../../shared/lib/cn';

interface FoodSearchProps {
  meal: MealType;
  onAdd: (entry: DiaryEntry) => void;
  onClose: () => void;
}

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function FoodSearch({ meal, onAdd, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [grams, setGrams] = useState('100');

  const results = useMemo(() => searchProducts(query), [query]);
  const gramsNum = Number(grams);
  const gramsValid = grams.trim() !== '' && gramsNum > 0;
  const preview = selected && gramsValid ? nutrientsForPortion(selected, gramsNum) : null;

  const handleAdd = (): void => {
    if (!selected || !gramsValid) return;
    onAdd({
      id: uid(),
      meal,
      productId: selected.id,
      productName: selected.name,
      grams: gramsNum,
      nutrients: nutrientsForPortion(selected, gramsNum),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-bg p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Добавить в «{MEAL_LABELS[meal]}»</h2>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="text-muted">
            ✕
          </button>
        </div>

        {!selected ? (
          <>
            <input
              data-testid="search-input"
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск продукта…"
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-brand"
            />

            <div className="mt-3 space-y-2">
              {query.trim().length >= 2 && results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line p-6 text-center">
                  <p className="text-sm text-muted">Ничего не нашлось по запросу «{query}».</p>
                  <p className="mt-1 text-sm text-muted">Попробуйте другое название.</p>
                </div>
              )}

              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`result-${p.id}`}
                  onClick={() => setSelected(p)}
                  className="flex w-full items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-[13px] text-muted">{p.per100.calories} ккал/100г</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <div className="font-semibold">{selected.name}</div>
              <label className="mt-3 block text-sm font-semibold" htmlFor="grams">
                Порция, г
              </label>
              <input
                id="grams"
                data-testid="grams-input"
                type="number"
                inputMode="numeric"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className={cn(
                  'mt-1 w-full rounded-2xl border bg-bg px-4 py-3 text-base outline-none focus:border-brand',
                  gramsValid ? 'border-line' : 'border-warn',
                )}
              />
              {!gramsValid && (
                <p role="alert" className="mt-1.5 text-[13px] font-medium text-warn">
                  Введите вес больше 0
                </p>
              )}

              {preview && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <Stat label="Ккал" value={preview.calories} />
                  <Stat label="Б" value={preview.protein} />
                  <Stat label="Ж" value={preview.fat} />
                  <Stat label="У" value={preview.carbs} />
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-2xl border border-line bg-card py-3.5 text-sm font-semibold text-muted"
              >
                Назад
              </button>
              <button
                type="button"
                data-testid="confirm-add"
                onClick={handleAdd}
                disabled={!gramsValid}
                className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Добавить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-bg py-2">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
