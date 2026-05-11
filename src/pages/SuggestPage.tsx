import { useState, useEffect, useCallback } from 'react';
import type { WordRequest } from '../types';
import { wordRequestStore } from '../store/wordRequestStore';

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pending review', classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  added:   { label: 'Added!',         classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  declined:{ label: 'Declined',       classes: 'bg-slate-500/15 text-slate-400 border-slate-600/30' },
};

export function SuggestPage() {
  const [word, setWord]       = useState('');
  const [context, setContext] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedWord, setSubmittedWord] = useState('');
  const [requests, setRequests] = useState<WordRequest[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setRequests(wordRequestStore.getAll());
    setVotedIds(new Set(wordRequestStore.getAll().filter(r => wordRequestStore.hasVoted(r.id)).map(r => r.id)));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    const req = wordRequestStore.submit(word, context);
    setSubmittedWord(req.word);
    setSubmitted(true);
    setWord('');
    setContext('');
    refresh();
  }

  function handleUpvote(id: string) {
    wordRequestStore.upvote(id);
    refresh();
  }

  function handleStatusChange(id: string, status: string) {
    wordRequestStore.updateStatus(id, status as 'pending' | 'added' | 'declined');
    refresh();
  }

  function handleCopyExport() {
    const text = wordRequestStore.exportPending();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const pending  = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Suggest a Word</h1>
      <p className="text-slate-400 text-sm mb-8">
        Missing a GRE word from our library? Submit it below — we review suggestions every week and
        add the most-requested ones.
      </p>

      {/* Submission form */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 mb-8">
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✓</div>
            <div className="text-white font-semibold text-lg mb-1">
              "{submittedWord}" submitted!
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Thanks — we'll review it in the next weekly update. Others can upvote your suggestion below.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-sm text-violet-400 hover:text-violet-300 transition"
            >
              Submit another word →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Word <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={word}
                onChange={e => setWord(e.target.value)}
                placeholder="e.g. sanguine, loquacious, ephemeral…"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Why this word? <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Where did you encounter it? Any helpful context or example sentence?"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!word.trim()}
              className="self-start px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition"
            >
              Submit suggestion
            </button>
          </form>
        )}
      </div>

      {/* Pending suggestions list */}
      {pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              Community Suggestions
              <span className="ml-2 text-sm font-normal text-slate-400">({pending.length} pending)</span>
            </h2>
            <span className="text-xs text-slate-500">Upvote words you also want to see added</span>
          </div>

          <div className="flex flex-col gap-2">
            {pending.map(req => (
              <SuggestionCard
                key={req.id}
                req={req}
                voted={votedIds.has(req.id)}
                onUpvote={() => handleUpvote(req.id)}
                showAdminControls={showAdmin}
                onStatusChange={status => handleStatusChange(req.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resolved suggestions */}
      {resolved.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-400 mb-3">
            Previously Reviewed
          </h2>
          <div className="flex flex-col gap-2">
            {resolved.map(req => (
              <SuggestionCard
                key={req.id}
                req={req}
                voted={votedIds.has(req.id)}
                onUpvote={() => handleUpvote(req.id)}
                showAdminControls={showAdmin}
                onStatusChange={status => handleStatusChange(req.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12 text-slate-600 text-sm">
          No suggestions yet — be the first to submit one.
        </div>
      )}

      {/* Admin panel */}
      <div className="mt-10 border-t border-slate-800 pt-6">
        <button
          onClick={() => setShowAdmin(v => !v)}
          className="text-xs text-slate-600 hover:text-slate-400 transition flex items-center gap-1"
        >
          <span>{showAdmin ? '▾' : '▸'}</span>
          Weekly Review Panel
        </button>

        {showAdmin && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white">Pending requests export</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Copy the list, paste into your editor, and add the approved words to{' '}
                  <code className="font-mono text-slate-400">src/data/words.ts</code>.
                </div>
              </div>
              <button
                onClick={handleCopyExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition"
              >
                {copied ? '✓ Copied!' : '⎘ Copy list'}
              </button>
            </div>
            <pre className="text-xs text-slate-400 bg-slate-800/60 rounded-lg p-4 whitespace-pre-wrap max-h-64 overflow-y-auto border border-slate-700">
              {wordRequestStore.exportPending()}
            </pre>
            <p className="text-xs text-slate-600 mt-3">
              Use the status controls on each card to mark words as Added or Declined after your weekly update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({
  req, voted, onUpvote, showAdminControls, onStatusChange,
}: {
  req: WordRequest;
  voted: boolean;
  onUpvote: () => void;
  showAdminControls: boolean;
  onStatusChange: (status: string) => void;
}) {
  const badge = STATUS_BADGE[req.status];
  const date  = new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isPending = req.status === 'pending';

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
      {/* Upvote */}
      <button
        onClick={onUpvote}
        disabled={voted || !isPending}
        title={voted ? 'Already upvoted' : 'Upvote this suggestion'}
        className={`flex flex-col items-center gap-0.5 min-w-[2.5rem] pt-0.5 transition ${
          voted || !isPending
            ? 'text-violet-400 cursor-default'
            : 'text-slate-500 hover:text-violet-400 cursor-pointer'
        }`}
      >
        <span className="text-sm">{voted ? '▲' : '△'}</span>
        <span className="text-xs font-semibold">{req.votes}</span>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-bold text-white">{req.word}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.classes}`}
          >
            {badge.label}
          </span>
          <span className="text-[11px] text-slate-600">{date}</span>
        </div>
        {req.context && (
          <p className="text-sm text-slate-400 line-clamp-2">{req.context}</p>
        )}
        {showAdminControls && isPending && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onStatusChange('added')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-600/30 transition"
            >
              ✓ Mark added
            </button>
            <button
              onClick={() => onStatusChange('declined')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
            >
              ✕ Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
