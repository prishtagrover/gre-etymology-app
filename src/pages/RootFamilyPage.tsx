import { useParams, useNavigate } from 'react-router-dom';
import { DATA } from '../data';
import { useProgress } from '../store/useProgress';
import { CategoryBadge } from '../components/shared/CategoryBadge';
import { ConnotationBadge } from '../components/shared/ConnotationBadge';
import { LearnedToggle } from '../components/shared/LearnedToggle';
import { AffixBreakdown } from '../components/shared/AffixBreakdown';

const originColors: Record<string, string> = {
  Latin: 'text-amber-400',
  Greek: 'text-sky-400',
  Other: 'text-rose-400',
  English: 'text-emerald-400',
};

export function RootFamilyPage() {
  const { rootId } = useParams<{ rootId: string }>();
  const navigate = useNavigate();
  const { progress, toggleLearned } = useProgress();

  const root = rootId ? DATA.rootsById[rootId] : null;
  const words = root ? (DATA.wordsByRootId[root.id] ?? []) : [];

  if (!root) {
    return (
      <div className="text-center py-20 text-slate-400">
        Root not found. <button onClick={() => navigate('/browse')} className="text-violet-400 underline">Back to Browse</button>
      </div>
    );
  }

  const learnedCount = words.filter(w => progress.words[w.id]?.learned).length;
  const colorClass = originColors[root.origin] ?? 'text-slate-300';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-slate-500 text-sm hover:text-slate-300 mb-5 flex items-center gap-1">
        ← Back
      </button>

      {/* Root header */}
      <div className="mb-8 p-5 rounded-2xl border border-slate-700 bg-slate-900/60">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`font-mono font-bold text-3xl ${colorClass}`}>
                {root.forms.join(' / ')}
              </span>
              <span className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-400">{root.origin}</span>
            </div>
            <div className="text-lg text-slate-300 mb-1">means <em>"{root.meaning}"</em></div>
            <div className="text-sm text-slate-500 italic">{root.sourceWord}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{learnedCount}<span className="text-slate-500 text-sm font-normal">/{words.length}</span></div>
            <div className="text-xs text-slate-500">words learned</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${words.length > 0 ? (learnedCount / words.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Word cards */}
      <div className="flex flex-col gap-4">
        {words.map(word => {
          const learned = progress.words[word.id]?.learned ?? false;
          const prefix = word.prefixId ? DATA.affixesById[word.prefixId] : null;
          const suffix = word.suffixId ? DATA.affixesById[word.suffixId] : null;

          return (
            <div
              key={word.id}
              className={`p-5 rounded-xl border transition-all ${
                learned ? 'border-emerald-800/50 bg-emerald-900/10' : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Word + badges */}
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{word.word}</h3>
                    <span className="text-xs text-slate-500 italic">{word.pos}</span>
                    <CategoryBadge cat={word.greCategory} />
                    <ConnotationBadge connotation={word.connotation} />
                  </div>

                  {/* Affix breakdown */}
                  <div className="mb-2">
                    <AffixBreakdown word={word} />
                    {prefix || suffix ? (
                      <div className="text-xs text-slate-500 mt-1.5">
                        {prefix && <span><strong className="text-violet-400">{prefix.form}</strong> ({prefix.meaning})</span>}
                        {prefix && suffix && <span className="mx-1">+</span>}
                        <strong className={colorClass}>{root.forms[0]}</strong>
                        <span className="text-slate-600"> ({root.meaning})</span>
                        {suffix && <span> + <strong className="text-amber-400">{suffix.form}</strong> ({suffix.meaning})</span>}
                      </div>
                    ) : null}
                  </div>

                  {/* Definition */}
                  <p className="text-slate-200 text-sm mb-2">{word.definition}</p>

                  {/* Example */}
                  <p className="text-slate-400 text-sm italic mb-3">"{word.exampleSentence}"</p>

                  {/* Synonyms */}
                  <div className="flex flex-wrap gap-1">
                    {word.synonyms.map(s => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <LearnedToggle learned={learned} onToggle={() => toggleLearned(word.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
