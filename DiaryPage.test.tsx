import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DiaryPage } from './DiaryPage';
import type { DailyNorm } from '../entities/nutrition/types';
import type { DiaryEntry } from '../entities/diary/diary';

const norm: DailyNorm = {
  calories: 2000,
  protein: 150,
  fat: 67,
  carbs: 200,
  cappedToSafeMinimum: false,
};

const entry: DiaryEntry = {
  id: 'e1',
  meal: 'lunch',
  productId: 'chicken',
  productName: 'Куриная грудка отварная',
  grams: 150,
  nutrients: { calories: 206, protein: 43.5, fat: 2.7, carbs: 0 },
};

describe('DiaryPage', () => {
  it('ПОЗИТИВНЫЙ СЦЕНАРИЙ: показывает остаток калорий с учётом записей', () => {
    render(
      <DiaryPage
        norm={norm}
        entries={[entry]}
        onAddEntry={vi.fn()}
        onRemoveEntry={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );
    // 2000 - 206 = 1794
    expect(screen.getByTestId('remaining-heading')).toHaveTextContent('Осталось 1794 ккал');
  });

  it('ПОЗИТИВНЫЙ СЦЕНАРИЙ: удаление записи дергает onRemoveEntry с её id', () => {
    const onRemoveEntry = vi.fn();
    render(
      <DiaryPage
        norm={norm}
        entries={[entry]}
        onAddEntry={vi.fn()}
        onRemoveEntry={onRemoveEntry}
        onEditGoal={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('remove-e1'));
    expect(onRemoveEntry).toHaveBeenCalledWith('e1');
  });

  it('ОБРАБОТКА КРАЯ: при превышении нормы показывает превышение, а не отрицательный остаток', () => {
    const heavy: DiaryEntry = {
      ...entry,
      id: 'e2',
      nutrients: { ...entry.nutrients, calories: 2500 },
    };
    render(
      <DiaryPage
        norm={norm}
        entries={[heavy]}
        onAddEntry={vi.fn()}
        onRemoveEntry={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );
    expect(screen.getByTestId('remaining-heading')).toHaveTextContent('Превышение на 500 ккал');
  });

  it('открывает поиск продукта по кнопке приёма пищи', () => {
    render(
      <DiaryPage
        norm={norm}
        entries={[]}
        onAddEntry={vi.fn()}
        onRemoveEntry={vi.fn()}
        onEditGoal={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('add-breakfast'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByTestId('search-input')).toBeInTheDocument();
  });
});
