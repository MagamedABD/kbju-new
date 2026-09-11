import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('ПОЗИТИВНЫЙ СЦЕНАРИЙ: при валидном вводе вызывает onSubmit с параметрами', () => {
    const onSubmit = vi.fn();
    render(<Onboarding onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('age'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('height'), { target: { value: '180' } });
    fireEvent.change(screen.getByTestId('weight'), { target: { value: '80' } });
    fireEvent.click(screen.getByText('Рассчитать'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ age: 30, heightCm: 180, weightKg: 80 }),
    );
  });

  it('ОБРАБОТКА ОШИБОК: не сабмитит и показывает ошибку при пустом поле', () => {
    const onSubmit = vi.fn();
    render(<Onboarding onSubmit={onSubmit} />);

    // Заполняем не всё — вес оставляем пустым.
    fireEvent.change(screen.getByTestId('age'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('height'), { target: { value: '180' } });
    fireEvent.click(screen.getByText('Рассчитать'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('ОБРАБОТКА ОШИБОК: отклоняет значение вне допустимого диапазона', () => {
    const onSubmit = vi.fn();
    render(<Onboarding onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('age'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('height'), { target: { value: '180' } });
    fireEvent.change(screen.getByTestId('weight'), { target: { value: '80' } });
    fireEvent.click(screen.getByText('Рассчитать'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Допустимо от/)).toBeInTheDocument();
  });
});
