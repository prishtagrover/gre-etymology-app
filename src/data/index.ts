import type { DataIndex, RootOrigin } from '../types';
import { WORDS } from './words';
import { ROOTS } from './roots';
import { AFFIXES } from './affixes';

export { WORDS, ROOTS, AFFIXES };

function buildIndex(): DataIndex {
  const wordsById = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const rootsById = Object.fromEntries(ROOTS.map(r => [r.id, r]));
  const affixesById = Object.fromEntries(AFFIXES.map(a => [a.id, a]));

  const wordsByRootId: Record<string, typeof WORDS> = {};
  for (const word of WORDS) {
    if (!wordsByRootId[word.rootId]) wordsByRootId[word.rootId] = [];
    wordsByRootId[word.rootId].push(word);
  }

  const origins: RootOrigin[] = ['Latin', 'Greek', 'Other', 'English'];
  const rootsByOrigin = Object.fromEntries(
    origins.map(o => [o, ROOTS.filter(r => r.origin === o)])
  ) as Record<RootOrigin, typeof ROOTS>;

  const wordsByAffixId: Record<string, typeof WORDS> = {};
  for (const word of WORDS) {
    for (const affixId of [word.prefixId, word.suffixId]) {
      if (!affixId) continue;
      if (!wordsByAffixId[affixId]) wordsByAffixId[affixId] = [];
      wordsByAffixId[affixId].push(word);
    }
  }

  return { wordsById, rootsById, affixesById, wordsByRootId, rootsByOrigin, wordsByAffixId, allWords: WORDS, allRoots: ROOTS };
}

export const DATA: DataIndex = buildIndex();
