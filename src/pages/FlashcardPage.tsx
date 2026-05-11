import { useState, useEffect, useCallback } from 'react';
import type { GRECategory, RootOrigin, Connotation, Word } from '../types';
import { DATA } from '../data';
import { useProgress } from '../store/useProgress';
import { CategoryBadge } from '../components/shared/CategoryBadge';
import { ConnotationBadge } from '../components/shared/ConnotationBadge';
import { LearnedToggle } from '../components/shared/LearnedToggle';
import { AffixBreakdown } from '../components/shared/AffixBreakdown';

const CATS: GRECategory[] = [1, 2, 3, 4, 5];
const ORIGINS: RootOrigin[] = ['Latin', 'Greek', 'Other', 'English'];
const CONNOTATIONS: Connotation[] = ['positive', 'negative', 'neutral'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashcardPage() {
  const { progress, toggleLearned, recordSeen } = useProgress();

  const [cats, setCats] = useState<GRECategory[]>([1, 2]);
  const [origins, setOrigins] = useState<RootOrigin[]>([]);
  const [connotations, setConnotations] = useState<Connotation[]>([]);
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [queue, setQueue] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const buildQueue = useCallback(() => {
    let words = DATA.allWords;
    if (cats.length > 0) words = words.filter(w => cats.includes(w.greCategory));
    if (origins.length > 0) words = words.filter(w => origins.includes(DATA.rootsById[w.rootId]?.origin as RootOrigin));
    if (connotations.length > 0) words = words.filter(w => connotations.includes(w.connotation));
    if (onlyUnlearned) words = words.filter(w => !progress.words[w.id]?.learned);
    return shuffle(words);
  }, [cats, origins, connotations, onlyUnlearned, progress]);

  useEffect(() => {
    const q = buildQueue();
    setQueue(q);
    setIndex(0);
    setFlipped(false);
    setSessionDone(q.length === 0);
  }, [buildQueue]);

  const current = queue[index];

  const next = useCallback(() => {
    if (current) recordSeen([current.id]);
    if (index + 1 >= queue.length) {
      setSessionDone(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  }, [index, queue, current, recordSeen]);

  const prev = useCallback(() => {
    if (index > 0) { setIndex(i => i - 1); setFlipped(false); }
  }, [index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const restart = () => {
    const q = buildQueue();
    setQueue(q);
    setIndex(0);
    setFlipped(false);
    setSessionDone(false);
  };

  function toggleCat(c: GRECategory) {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function toggleOrigin(o: RootOrigin) {
    setOrigins(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  }
  function toggleConnotation(c: Connotation) {
    setConnotations(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  const root = current ? DATA.rootsById[current.rootId] : null;
  const prefix = current?.prefixId ? DATA.affixesById[current.prefixId] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-slate-400 text-sm">Space / ↑ to flip · ← → to navigate</p>
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition"
        >
          <span>⊟</span> Filters
          {(cats.length > 0 || origins.length > 0 || connotations.length > 0 || onlyUnlearned) && (
            <span className="w-2 h-2 rounded-full bg-violet-400" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-slate-900/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">GRE Category</div>
              <div className="flex flex-wrap gap-1.5">
                {CATS.map(c => (
                  <button key={c} onClick={() => toggleCat(c)}
                    className={`px-2.5 py-1 rounded-full text-xs border font-mono transition ${cats.includes(c) ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                    Cat {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Origin</div>
              <div className="flex flex-wrap gap-1.5">
                {ORIGINS.map(o => (
                  <button key={o} onClick={() => toggleOrigin(o)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition ${origins.includes(o) ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Connotation</div>
              <div className="flex flex-wrap gap-1.5">
                {CONNOTATIONS.map(c => (
                  <button key={c} onClick={() => toggleConnotation(c)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition capitalize ${connotations.includes(c) ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer text-xs text-slate-400">
                <input type="checkbox" checked={onlyUnlearned} onChange={e => setOnlyUnlearned(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 accent-violet-500" />
                Unlearned only
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Session done */}
      {sessionDone && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-xl text-white font-bold mb-2">Session complete!</div>
          <div className="text-slate-400 text-sm mb-6">You went through {queue.length} card{queue.length !== 1 ? 's' : ''}.</div>
          <button onClick={restart} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition">
            Shuffle & Restart
          </button>
        </div>
      )}

      {!sessionDone && queue.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No cards match the current filters.
        </div>
      )}

      {!sessionDone && current && root && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
              <div className="h-1.5 rounded-full bg-violet-500 transition-all" style={{ width: `${(index / queue.length) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{index + 1} / {queue.length}</span>
          </div>

          {/* Card */}
          <div className="perspective w-full" style={{ height: '360px' }}>
            <div
              className={`flip-card w-full h-full cursor-pointer ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(f => !f)}
            >
              {/* FRONT */}
              <div className="flip-front w-full h-full rounded-2xl border border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-8 select-none">
                <div className="flex items-center gap-2 mb-4">
                  <CategoryBadge cat={current.greCategory} />
                  <ConnotationBadge connotation={current.connotation} />
                  <span className="text-xs px-2 py-0.5 rounded border border-slate-700 text-slate-500">{root.origin}</span>
                </div>
                <div className="text-5xl font-bold text-white mb-3">{current.word}</div>
                <div className="text-slate-500 text-sm italic">{current.pos}</div>
                <div className="mt-4 text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="font-mono text-slate-500">{root.forms[0]}</span>
                  <span>→</span>
                  <span className="italic">"{root.meaning}"</span>
                  {prefix && (
                    <span className="text-violet-500"> · {prefix.form} = {prefix.meaning}</span>
                  )}
                </div>
                <div className="mt-6 text-xs text-slate-700">tap or press Space to flip</div>
              </div>

              {/* BACK */}
              <div className="flip-back w-full h-full rounded-2xl border border-violet-800/40 bg-[#1a1728] flex flex-col justify-center p-8 select-none overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <CategoryBadge cat={current.greCategory} />
                  <ConnotationBadge connotation={current.connotation} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{current.word}</div>
                <div className="text-violet-200 text-sm mb-3">{current.definition}</div>
                <p className="text-slate-400 text-sm italic mb-3">"{current.exampleSentence}"</p>
                <div className="mb-3">
                  <AffixBreakdown word={current} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {current.synonyms.map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-5">
            <button onClick={prev} disabled={index === 0}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition">
              ← Prev
            </button>
            <LearnedToggle
              learned={progress.words[current.id]?.learned ?? false}
              onToggle={() => toggleLearned(current.id)}
            />
            <button onClick={next}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition">
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
