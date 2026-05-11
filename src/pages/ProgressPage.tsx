import type { GRECategory, RootOrigin } from '../types';
import { DATA } from '../data';
import { useProgress } from '../store/useProgress';

const CATS: GRECategory[] = [1, 2, 3, 4, 5];
const ORIGINS: RootOrigin[] = ['Latin', 'Greek', 'Other', 'English'];

const catLabels: Record<GRECategory, string> = {
  1: 'Cat 1 — Essential',
  2: 'Cat 2 — High frequency',
  3: 'Cat 3 — Moderate',
  4: 'Cat 4 — Lower frequency',
  5: 'Cat 5 — Rare',
};

const catColors: Record<GRECategory, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-slate-500',
};

const originColors: Record<RootOrigin, string> = {
  Latin: 'bg-amber-500',
  Greek: 'bg-sky-500',
  Other: 'bg-rose-500',
  English: 'bg-emerald-500',
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-sm text-slate-400">{sub}</div>}
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export function ProgressPage() {
  const { progress, learnedCount, reset } = useProgress();
  const total = DATA.allWords.length;

  const catStats = CATS.map(cat => {
    const words = DATA.allWords.filter(w => w.greCategory === cat);
    const learned = words.filter(w => progress.words[w.id]?.learned).length;
    return { cat, total: words.length, learned };
  });

  const originStats = ORIGINS.map(origin => {
    const words = DATA.allWords.filter(w => DATA.rootsById[w.rootId]?.origin === origin);
    const learned = words.filter(w => progress.words[w.id]?.learned).length;
    return { origin, total: words.length, learned };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Progress</h1>
      <p className="text-slate-400 text-sm mb-6">Track your vocabulary mastery across categories and origins</p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Words Learned" value={learnedCount} sub={`of ${total}`} />
        <StatCard label="Overall" value={`${Math.round((learnedCount / total) * 100)}%`} />
        <StatCard label="Current Streak" value={progress.currentStreak} sub="days" />
        <StatCard label="Longest Streak" value={progress.longestStreak} sub="days" />
      </div>

      {/* Overall progress ring */}
      <div className="mb-8 p-5 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2130" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
                strokeDasharray={`${(learnedCount / total) * 100} 100`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {Math.round((learnedCount / total) * 100)}%
            </span>
          </div>
          <div>
            <div className="text-white font-semibold mb-1">Overall Mastery</div>
            <div className="text-slate-400 text-sm">
              {learnedCount} of {total} words marked as learned
            </div>
            <div className="text-slate-500 text-xs mt-1">
              {total - learnedCount} words remaining
            </div>
          </div>
        </div>
      </div>

      {/* By GRE Category */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">By GRE Category</h2>
        <div className="flex flex-col gap-3">
          {catStats.map(({ cat, total: t, learned: l }) => (
            <div key={cat} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">{catLabels[cat]}</span>
                <span className="text-sm text-slate-400 tabular-nums">{l}/{t}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full ${catColors[cat]} transition-all`}
                  style={{ width: t > 0 ? `${(l / t) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Origin */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">By Etymology Origin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {originStats.map(({ origin, total: t, learned: l }) => (
            <div key={origin} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">{origin}</span>
                <span className="text-sm text-slate-400">{l}/{t}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full ${originColors[origin]} transition-all`}
                  style={{ width: t > 0 ? `${(l / t) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {progress.activityLog.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="flex flex-col gap-2">
            {[...progress.activityLog].reverse().slice(0, 7).map(entry => (
              <div key={entry.date} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-sm text-slate-400">{entry.date}</span>
                <span className="text-sm text-slate-300">{entry.count} words studied</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => { if (confirm('Reset all progress? This cannot be undone.')) reset(); }}
          className="text-sm text-rose-400 hover:text-rose-300 transition"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
