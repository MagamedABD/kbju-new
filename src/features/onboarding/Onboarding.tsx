import { useState } from 'react';
import { validateParams } from '../../entities/nutrition/calc';
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  type ActivityLevel,
  type Goal,
  type Sex,
  type UserParams,
} from '../../entities/nutrition/types';
import { cn } from '../../shared/lib/cn';

interface OnboardingProps {
  onSubmit: (params: UserParams) => void;
}

const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

export function Onboarding({ onSubmit }: OnboardingProps) {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('medium');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [errors, setErrors] = useState<Partial<Record<keyof UserParams, string>>>({});

  const handleSubmit = (): void => {
    const parsed = { age: num(age), heightCm: num(height), weightKg: num(weight) };
    const result = validateParams(parsed);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit({
      sex,
      age: parsed.age as number,
      heightCm: parsed.heightCm as number,
      weightKg: parsed.weightKg as number,
      activity,
      goal,
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Шаг 1</div>
      <h1 className="text-[26px] font-bold tracking-tight">Рассчитаем вашу норму</h1>
      <p className="mt-1 text-sm text-muted">
        Заполните параметры — получите дневную норму калорий и БЖУ.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <span className="mb-2 block text-sm font-semibold">Пол</span>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sex === s}
                onClick={() => setSex(s)}
                className={cn(
                  'rounded-2xl border py-3 text-sm font-semibold transition-colors',
                  sex === s ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-card text-muted',
                )}
              >
                {s === 'male' ? 'Мужской' : 'Женский'}
              </button>
            ))}
          </div>
        </div>

        <NumberField label="Возраст, лет" value={age} onChange={setAge} error={errors.age} testId="age" />
        <NumberField label="Рост, см" value={height} onChange={setHeight} error={errors.heightCm} testId="height" />
        <NumberField label="Вес, кг" value={weight} onChange={setWeight} error={errors.weightKg} testId="weight" />

        <SelectField
          label="Уровень активности"
          value={activity}
          onChange={(v) => setActivity(v as ActivityLevel)}
          options={ACTIVITY_LABELS}
        />
        <SelectField
          label="Цель"
          value={goal}
          onChange={(v) => setGoal(v as Goal)}
          options={GOAL_LABELS}
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Рассчитать
        </button>
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  testId: string;
}

function NumberField({ label, value, onChange, error, testId }: NumberFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold" htmlFor={testId}>
        {label}
      </label>
      <input
        id={testId}
        data-testid={testId}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-2xl border bg-card px-4 py-3 text-base outline-none',
          'focus:border-brand',
          error ? 'border-warn' : 'border-line',
        )}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] font-medium text-warn">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-brand"
      >
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
