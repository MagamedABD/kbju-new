import { cn } from '../lib/cn';

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
}

export function MacroBar({ label, value, target, color }: MacroBarProps) {
  const ratio = target > 0 ? Math.min(value / target, 1) : 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-xl font-bold">
        {Math.round(value)}
        <span className="text-[13px] font-medium text-muted"> / {target} г</span>
      </div>
      <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-line">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500')}
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
