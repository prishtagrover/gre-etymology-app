import type { UserProgress } from '../types';

const KEY = 'gre_vocab_progress';
const VERSION = 1;

export function defaultProgress(): UserProgress {
  return { version: VERSION, words: {}, activityLog: [], currentStreak: 0, longestStreak: 0, lastActiveDate: null };
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw) as UserProgress;
    return p.version === VERSION ? p : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: UserProgress): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProgress(): void {
  localStorage.removeItem(KEY);
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function markWordLearned(p: UserProgress, wordId: string, learned: boolean): UserProgress {
  const entry = p.words[wordId] ?? { learned: false, lastSeenAt: null, timesSeen: 0 };
  return { ...p, words: { ...p.words, [wordId]: { ...entry, learned, lastSeenAt: Date.now() } } };
}

export function recordWordSeen(p: UserProgress, wordIds: string[]): UserProgress {
  const today = todayStr();
  const updatedWords = { ...p.words };
  for (const id of wordIds) {
    const e = updatedWords[id] ?? { learned: false, lastSeenAt: null, timesSeen: 0 };
    updatedWords[id] = { ...e, timesSeen: e.timesSeen + 1, lastSeenAt: Date.now() };
  }

  const logCopy = [...p.activityLog];
  const idx = logCopy.findIndex(e => e.date === today);
  if (idx >= 0) logCopy[idx] = { date: today, count: logCopy[idx].count + wordIds.length };
  else logCopy.push({ date: today, count: wordIds.length });

  // Streak calc
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  let currentStreak = p.currentStreak;
  if (p.lastActiveDate === today) {
    // already counted today
  } else if (p.lastActiveDate === yesterdayStr) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(p.longestStreak, currentStreak);

  return { ...p, words: updatedWords, activityLog: logCopy, currentStreak, longestStreak, lastActiveDate: today };
}
