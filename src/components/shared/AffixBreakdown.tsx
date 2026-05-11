import type { Word } from '../../types';
import { DATA } from '../../data';

export function AffixBreakdown({ word }: { word: Word }) {
  const prefix = word.prefixId ? DATA.affixesById[word.prefixId] : null;
  const suffix = word.suffixId ? DATA.affixesById[word.suffixId] : null;
  const root = DATA.rootsById[word.rootId];

  if (!prefix && !suffix) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {prefix && (
        <span className="px-2 py-1 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300">
          <span className="font-mono font-bold">{prefix.form}</span>
          <span className="text-violet-400 ml-1">"{prefix.meaning}"</span>
        </span>
      )}
      <span className="px-2 py-1 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300">
        <span className="font-mono font-bold">{root.forms[0]}</span>
        <span className="text-sky-400 ml-1">"{root.meaning}"</span>
      </span>
      {suffix && (
        <span className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <span className="font-mono font-bold">{suffix.form}</span>
          <span className="text-amber-400 ml-1">"{suffix.meaning}"</span>
        </span>
      )}
    </div>
  );
}
