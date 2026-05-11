import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RootOrigin } from '../types';
import { DATA } from '../data';
import { useProgress } from '../store/useProgress';


const ORIGINS: RootOrigin[] = ['Latin', 'Greek', 'Other', 'English'];

const originColors: Record<RootOrigin, { tab: string; dot: string }> = {
  Latin:   { tab: 'border-amber-500 text-amber-300',   dot: 'bg-amber-500' },
  Greek:   { tab: 'border-sky-500 text-sky-300',       dot: 'bg-sky-500' },
  Other:   { tab: 'border-rose-500 text-rose-300',     dot: 'bg-rose-500' },
  English: { tab: 'border-emerald-500 text-emerald-300', dot: 'bg-emerald-500' },
};

const originDescriptions: Record<RootOrigin, string> = {
  Latin:   'Latin roots form the backbone of academic English. Most GRE words trace back here.',
  Greek:   'Greek roots dominate scientific, philosophical, and intellectual vocabulary.',
  Other:   'Words from French, Arabic, and other languages — often borrowed wholesale.',
  English: 'Native Old English and Germanic roots — fewer on GRE, but important for context.',
};

export function BrowsePage() {
  const [active, setActive] = useState<RootOrigin>('Latin');
  const { progress } = useProgress();
  const navigate = useNavigate();

  const roots = DATA.rootsByOrigin[active] ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Browse by Etymology</h1>
      <p className="text-slate-400 text-sm mb-6">Explore word families organized by linguistic origin</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-800">
        {ORIGINS.map(origin => {
          const wordCount = DATA.rootsByOrigin[origin]?.reduce((s, r) => s + (DATA.wordsByRootId[r.id]?.length ?? 0), 0) ?? 0;
          const { tab, dot } = originColors[origin];
          return (
            <button
              key={origin}
              onClick={() => setActive(origin)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                active === origin ? `${tab} bg-slate-800/30` : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {origin}
              <span className="text-xs opacity-60">({wordCount})</span>
            </button>
          );
        })}
      </div>

      <p className="text-slate-400 text-sm mb-5">{originDescriptions[active]}</p>

      {roots.length === 0 ? (
        <div className="text-slate-500 text-sm py-10 text-center">No roots in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roots.map(root => {
            const words = DATA.wordsByRootId[root.id] ?? [];
            if (words.length === 0) return null;
            const learnedInRoot = words.filter(w => progress.words[w.id]?.learned).length;
            const pct = words.length > 0 ? Math.round((learnedInRoot / words.length) * 100) : 0;
            const { dot } = originColors[active];

            return (
              <button
                key={root.id}
                onClick={() => navigate(`/browse/root/${root.id}`)}
                className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                      {root.forms.join(' / ')}
                    </span>
                    <div className="text-xs text-slate-500 mt-0.5 italic">{root.sourceWord}</div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${dot} mt-1 shrink-0`} />
                </div>
                <div className="text-sm text-slate-300 mb-3">"<em>{root.meaning}</em>"</div>

                {/* Sample words */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {words.slice(0, 4).map(w => (
                    <span key={w.id} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {w.word}
                    </span>
                  ))}
                  {words.length > 4 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">+{words.length - 4}</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-800">
                    <div className="h-1 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500">{learnedInRoot}/{words.length}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
