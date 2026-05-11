import { useNavigate } from 'react-router-dom';
import { DATA } from '../data';
import { useProgress } from '../store/useProgress';
import { CategoryBadge } from '../components/shared/CategoryBadge';
import { ConnotationBadge } from '../components/shared/ConnotationBadge';

export function HomePage() {
  const { progress, learnedCount } = useProgress();
  const navigate = useNavigate();
  const total = DATA.allWords.length;
  const pct = Math.round((learnedCount / total) * 100);

  // Today's suggested words: unlearned Cat 1 first
  const suggested = DATA.allWords
    .filter(w => !progress.words[w.id]?.learned)
    .sort((a, b) => a.greCategory - b.greCategory)
    .slice(0, 5);

  const originCounts = (['Latin', 'Greek', 'Other', 'English'] as const).map(origin => ({
    origin,
    count: DATA.allWords.filter(w => DATA.rootsById[w.rootId]?.origin === origin).length,
  }));

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">GRE Vocabulary</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Learn GRE words through their etymology — understand the Latin & Greek roots that unlock dozens of related words at once.
        </p>
      </div>

      {/* Overall progress */}
      <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900/60 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-semibold">Your Progress</div>
          <div className="text-slate-400 text-sm">{learnedCount} / {total} words</div>
        </div>
        <div className="h-3 rounded-full bg-slate-800 mb-2">
          <div className="h-3 rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{pct}% complete</span>
          <span>🔥 {progress.currentStreak} day streak</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: '◈', label: 'Study Cat 1', sub: 'Essential words', action: () => navigate('/flashcards?cats=1') },
          { icon: '⊞', label: 'Browse Roots', sub: 'Latin & Greek', action: () => navigate('/browse') },
          { icon: '⊕', label: 'Explore Affixes', sub: 'Prefixes & suffixes', action: () => navigate('/affixes') },
          { icon: '◎', label: 'View Progress', sub: 'Stats & streaks', action: () => navigate('/progress') },
        ].map(({ icon, label, sub, action }) => (
          <button key={label} onClick={action}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50 transition text-left">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-xs text-slate-500">{sub}</div>
          </button>
        ))}
      </div>

      {/* Origin overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Word Origins</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {originCounts.map(({ origin, count }) => {
            const colorMap: Record<string, string> = {
              Latin: 'border-amber-700/30 text-amber-400', Greek: 'border-sky-700/30 text-sky-400',
              Other: 'border-rose-700/30 text-rose-400', English: 'border-emerald-700/30 text-emerald-400',
            };
            return (
              <button key={origin} onClick={() => navigate('/browse')}
                className={`p-3 rounded-xl border bg-slate-900/40 hover:bg-slate-800/50 transition text-left ${colorMap[origin]}`}>
                <div className="font-semibold text-base">{origin}</div>
                <div className="text-xs opacity-70">{count} words</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested words */}
      {suggested.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Up Next — Unlearned Words</h2>
          <div className="flex flex-col gap-2">
            {suggested.map(word => {
              const root = DATA.rootsById[word.rootId];
              return (
                <div key={word.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 cursor-pointer hover:border-slate-600 hover:bg-slate-800/40 transition"
                  onClick={() => navigate(`/browse/root/${word.rootId}`)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-white">{word.word}</span>
                      <span className="text-xs text-slate-500 italic">{word.pos}</span>
                      <CategoryBadge cat={word.greCategory} size="xs" />
                      <ConnotationBadge connotation={word.connotation} size="xs" />
                    </div>
                    <div className="text-sm text-slate-400 truncate">{word.definition}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Root: <span className="font-mono text-slate-500">{root?.forms[0]}</span>
                      {root && <span className="text-slate-600"> — "{root.meaning}"</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => navigate('/flashcards')}
            className="mt-3 w-full py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition">
            Study all with flashcards →
          </button>
        </div>
      )}

      {learnedCount === total && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🏆</div>
          <div className="text-white font-bold text-lg">All words learned!</div>
          <div className="text-slate-400 text-sm">Impressive. The GRE doesn't stand a chance.</div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600">
        <span>Part of <a href="https://www.archimedeslab.org/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-violet-400 transition">Archimedes Lab</a></span>
        <span>{total} words · free · no account needed</span>
      </div>
    </div>
  );
}
