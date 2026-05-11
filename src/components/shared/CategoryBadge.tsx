import type { GRECategory } from '../../types';

const config: Record<GRECategory, { label: string; classes: string }> = {
  1: { label: 'Cat 1', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  2: { label: 'Cat 2', classes: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  3: { label: 'Cat 3', classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  4: { label: 'Cat 4', classes: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  5: { label: 'Cat 5', classes: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

const tooltips: Record<GRECategory, string> = {
  1: 'Essential – appears on virtually every GRE',
  2: 'High frequency – very commonly tested',
  3: 'Moderate – regularly tested',
  4: 'Lower frequency – sometimes tested',
  5: 'Rare – occasionally tested',
};

export function CategoryBadge({ cat, size = 'sm' }: { cat: GRECategory; size?: 'sm' | 'xs' }) {
  const { label, classes } = config[cat];
  return (
    <span
      title={tooltips[cat]}
      className={`inline-flex items-center border rounded font-mono font-semibold tracking-wide ${classes} ${
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      {label}
    </span>
  );
}
