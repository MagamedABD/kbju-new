interface CalorieRingProps {
  consumed: number;
  target: number;
}

const SIZE = 190;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2 - 1;
const CIRC = 2 * Math.PI * RADIUS;

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const ratio = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = CIRC * (1 - ratio);
  const remaining = Math.max(target - consumed, 0);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        role="img"
        aria-label={`Съедено ${consumed} из ${target} ккал`}
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#ecebe6" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#3f7d5a"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold leading-none tracking-tight">
          {consumed}
          <span className="text-base font-medium text-muted"> / {target}</span>
        </div>
        <div className="mt-1 text-sm text-muted">
          Осталось <b className="text-ink">{remaining}</b> ккал
        </div>
      </div>
    </div>
  );
}
