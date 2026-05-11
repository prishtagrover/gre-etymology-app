import type { Connotation } from '../../types';

const config: Record<Connotation, { symbol: string; classes: string; label: string }> = {
  positive: { symbol: '+', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Positive connotation' },
  negative: { symbol: '−', classes: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Negative connotation' },
  neutral:  { symbol: '○', classes: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Neutral connotation' },
};

export function ConnotationBadge({ connotation, size = 'sm' }: { connotation: Connotation; size?: 'sm' | 'xs' }) {
  const { symbol, classes, label } = config[connotation];
  return (
    <span
      title={label}
      className={`inline-flex items-center border rounded font-mono font-bold ${classes} ${
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      {symbol}
    </span>
  );
}
