import { useState, useCallback } from 'react';
import type { UserProgress } from '../types';
import { loadProgress, saveProgress, markWordLearned, recordWordSeen, resetProgress } from './progressStore';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  const update = useCallback((next: UserProgress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const toggleLearned = useCallback((wordId: string) => {
    setProgress(prev => {
      const current = prev.words[wordId]?.learned ?? false;
      const next = markWordLearned(prev, wordId, !current);
      saveProgress(next);
      return next;
    });
  }, []);

  const recordSeen = useCallback((wordIds: string[]) => {
    setProgress(prev => {
      const next = recordWordSeen(prev, wordIds);
      saveProgress(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    resetProgress();
    setProgress(loadProgress());
  }, []);

  const learnedCount = Object.values(progress.words).filter(w => w.learned).length;

  return { progress, update, toggleLearned, recordSeen, reset, learnedCount };
}
