import { useState } from 'react';
import type { Affix } from '../types';
import { DATA } from '../data';
import { CategoryBadge } from '../components/shared/CategoryBadge';
import { ConnotationBadge } from '../components/shared/ConnotationBadge';

const originColors: Record<string, string> = {
  Latin: 'text-amber-400',
  Greek: 'text-sky-400',
  Other: 'text-rose-400',
  English: 'text-emerald-400',
};

export function AffixPage() {
  const [tab, setTab] = useState<'prefix' | 'suffix'>('prefix');
  const [selected, setSelected] = useState<Affix | null>(null);

  const affixes = DATA.affixesById ? Object.values(DATA.affixesById).filter(a => a.type === tab) : [];
  const exampleWords = selected ? (DATA.wordsByAffixId[selected.id] ?? []) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Affix Explorer</h1>
      <p className="text-slate-400 text-sm mb-6">See how prefixes and suffixes change meaning when added to roots</p>

      <div className="flex gap-1 mb-6 border-b border-slate-800">
        {(['prefix', 'suffix'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition capitalize ${
              tab === t ? 'border-violet-500 text-violet-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {t}es
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List */}
        <div className="flex flex-col gap-2">
          {affixes.map(affix => {
            const wordCount = DATA.wordsByAffixId[affix.id]?.length ?? 0;
            if (wordCount === 0) return null;
            return (
              <button key={affix.id} onClick={() => setSelected(affix)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  selected?.id === affix.id
                    ? 'border-violet-600/50 bg-violet-900/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/40'
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-white text-base">{affix.form}</span>
                    <span className={`ml-2 text-sm ${originColors[affix.origin] ?? 'text-slate-400'}`}>
                      {affix.origin}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{wordCount} words</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">"{affix.meaning}"</div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div>
          {!selected ? (
            <div className="text-slate-500 text-sm py-10 text-center border border-slate-800 rounded-xl">
              Select a {tab} to see examples
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-900/60 sticky top-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-2xl text-white">{selected.form}</span>
                  <span className={`text-sm ${originColors[selected.origin] ?? 'text-slate-400'}`}>{selected.origin}</span>
                </div>
                <div className="text-slate-300">means: <em>"{selected.meaning}"</em></div>
              </div>

              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                Words using this {tab}
              </div>

              <div className="flex flex-col gap-3">
                {exampleWords.map(word => {
                  const root = DATA.rootsById[word.rootId];
                  return (
                    <div key={word.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <span className="font-bold text-white">{word.word}</span>
                        <span className="text-xs text-slate-500 italic">{word.pos}</span>
                        <CategoryBadge cat={word.greCategory} size="xs" />
                        <ConnotationBadge connotation={word.connotation} size="xs" />
                      </div>
                      {/* Show how affix + root = word */}
                      <div className="text-xs mb-1.5">
                        {word.prefixId === selected.id && (
                          <span>
                            <span className="text-violet-400 font-mono">{selected.form}</span>
                            <span className="text-slate-500"> + </span>
                            <span className={`font-mono ${originColors[root?.origin ?? ''] ?? 'text-slate-400'}`}>
                              {root?.forms[0]}
                            </span>
                            <span className="text-slate-500"> ({root?.meaning}) = </span>
                            <span className="text-white">{word.word}</span>
                          </span>
                        )}
                        {word.suffixId === selected.id && (
                          <span>
                            <span className={`font-mono ${originColors[root?.origin ?? ''] ?? 'text-slate-400'}`}>
                              {root?.forms[0]}
                            </span>
                            <span className="text-slate-500"> ({root?.meaning}) + </span>
                            <span className="text-amber-400 font-mono">{selected.form}</span>
                            <span className="text-slate-500"> = </span>
                            <span className="text-white">{word.word}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">{word.definition}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
