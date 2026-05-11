import type { WordRequest, WordRequestStatus } from '../types';

const KEY = 'gre_word_requests';
const VOTED_KEY = 'gre_word_requests_voted';

function load(): WordRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(requests: WordRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(requests));
}

function loadVoted(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveVoted(voted: Set<string>) {
  localStorage.setItem(VOTED_KEY, JSON.stringify([...voted]));
}

export const wordRequestStore = {
  getAll(): WordRequest[] {
    return load().sort((a, b) => b.votes - a.votes || b.submittedAt - a.submittedAt);
  },

  submit(word: string, context: string): WordRequest {
    const requests = load();
    const trimmedWord = word.trim().toLowerCase();

    // If an identical pending word already exists, just upvote it
    const existing = requests.find(
      r => r.word.toLowerCase() === trimmedWord && r.status === 'pending',
    );
    if (existing) {
      existing.votes += 1;
      save(requests);
      return existing;
    }

    const req: WordRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      word: word.trim(),
      context: context.trim(),
      submittedAt: Date.now(),
      votes: 1,
      status: 'pending',
    };
    requests.push(req);
    save(requests);
    return req;
  },

  upvote(id: string): void {
    const voted = loadVoted();
    if (voted.has(id)) return;
    const requests = load();
    const req = requests.find(r => r.id === id);
    if (req) {
      req.votes += 1;
      save(requests);
      voted.add(id);
      saveVoted(voted);
    }
  },

  hasVoted(id: string): boolean {
    return loadVoted().has(id);
  },

  updateStatus(id: string, status: WordRequestStatus): void {
    const requests = load();
    const req = requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      save(requests);
    }
  },

  exportPending(): string {
    const pending = load().filter(r => r.status === 'pending')
      .sort((a, b) => b.votes - a.votes);
    if (pending.length === 0) return 'No pending requests.';
    return pending
      .map((r, i) => {
        const date = new Date(r.submittedAt).toLocaleDateString();
        const ctx = r.context ? `\n   Context: "${r.context}"` : '';
        return `${i + 1}. ${r.word}  [${r.votes} vote${r.votes !== 1 ? 's' : ''}] — ${date}${ctx}`;
      })
      .join('\n\n');
  },
};
