export type RootOrigin = 'Latin' | 'Greek' | 'Other' | 'English';
export type GRECategory = 1 | 2 | 3 | 4 | 5;
export type Connotation = 'positive' | 'negative' | 'neutral';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

export interface Affix {
  id: string;
  form: string;           // e.g. "a-", "-tion"
  type: 'prefix' | 'suffix';
  meaning: string;
  origin: RootOrigin;
  exampleWordIds: string[];
}

export interface Root {
  id: string;
  forms: string[];        // e.g. ["vert", "vers"]
  meaning: string;
  origin: RootOrigin;
  sourceWord: string;     // e.g. "vertere (Latin)"
  wordIds: string[];
}

export interface Word {
  id: string;
  word: string;
  pos: PartOfSpeech;
  greCategory: GRECategory;
  connotation: Connotation;
  rootId: string;
  prefixId: string | null;
  suffixId: string | null;
  definition: string;
  exampleSentence: string;
  synonyms: string[];
  mnemonic?: string;
}

export interface DataIndex {
  wordsById: Record<string, Word>;
  rootsById: Record<string, Root>;
  affixesById: Record<string, Affix>;
  wordsByRootId: Record<string, Word[]>;
  rootsByOrigin: Record<RootOrigin, Root[]>;
  wordsByAffixId: Record<string, Word[]>;
  allWords: Word[];
  allRoots: Root[];
}

export interface WordProgress {
  learned: boolean;
  lastSeenAt: number | null;
  timesSeen: number;
}

export interface ActivityEntry {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

export interface UserProgress {
  version: number;
  words: Record<string, WordProgress>;
  activityLog: ActivityEntry[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface FlashcardFilters {
  categories: GRECategory[];
  origins: RootOrigin[];
  connotations: Connotation[];
  onlyUnlearned: boolean;
}

export type WordRequestStatus = 'pending' | 'added' | 'declined';

export interface WordRequest {
  id: string;
  word: string;
  context: string;       // why they want this word / example usage
  submittedAt: number;   // Unix timestamp
  votes: number;
  status: WordRequestStatus;
}
