interface Props {
  learned: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export function LearnedToggle({ learned, onToggle, size = 'md' }: Props) {
  return (
    <button
      onClick={onToggle}
      title={learned ? 'Mark as not learned' : 'Mark as learned'}
      className={`flex items-center gap-1.5 rounded-full border transition-all ${
        learned
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
          : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
      } ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
    >
      <span>{learned ? '✓' : '○'}</span>
      <span>{learned ? 'Learned' : 'Mark learned'}</span>
    </button>
  );
}
