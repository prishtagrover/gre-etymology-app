/**
 * Pre-build SEO generator.
 *
 * Reads src/data/words.ts + roots.ts as plain text, extracts structured data,
 * and writes two files into public/:
 *   1. public/words.html  — full plain-HTML word list for crawlers / AI indexing
 *   2. public/sitemap.xml — sitemap including the static word index page
 *
 * Run: node scripts/generate-seo.mjs
 * Called automatically as "prebuild" in package.json.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

// ── helpers ────────────────────────────────────────────────────────────────

function extractBetween(line, startMarker, endMarker) {
  const start = line.indexOf(startMarker);
  if (start === -1) return null;
  const from = start + startMarker.length;
  const end  = line.indexOf(endMarker, from);
  if (end === -1) return null;
  return line.substring(from, end);
}

function extractSimple(line, key) {
  const m = line.match(new RegExp(`${key}: '([^']*)'`));
  return m ? m[1] : null;
}

function extractNumber(line, key) {
  const m = line.match(new RegExp(`${key}: (\\d)`));
  return m ? parseInt(m[1], 10) : null;
}

// ── parse words.ts ─────────────────────────────────────────────────────────

function parseWords() {
  const src = readFileSync(join(root, 'src/data/words.ts'), 'utf-8');
  const words = [];

  for (const line of src.split('\n')) {
    if (!line.includes("{ id: '")) continue;

    const id         = extractSimple(line, 'id');
    const word       = extractSimple(line, 'word');
    const pos        = extractSimple(line, 'pos');
    const cat        = extractNumber(line, 'greCategory');
    const connotation= extractSimple(line, 'connotation');
    const rootId     = extractSimple(line, 'rootId');
    const definition = extractBetween(line, "definition: '", "', exampleSentence:");

    if (word && definition) {
      words.push({ id, word, pos, cat, connotation, rootId, definition });
    }
  }

  return words;
}

// ── parse roots.ts ─────────────────────────────────────────────────────────

function parseRoots() {
  const src = readFileSync(join(root, 'src/data/roots.ts'), 'utf-8');
  const roots = [];
  let current = null;

  for (const line of src.split('\n')) {
    if (line.includes("id: '") && line.includes("'")) {
      const id      = extractSimple(line, 'id');
      const meaning = extractSimple(line, 'meaning');
      const origin  = extractSimple(line, 'origin');
      const sourceW = extractSimple(line, 'sourceWord');
      if (id && meaning) {
        current = { id, meaning, origin, sourceWord: sourceW, forms: [] };
        roots.push(current);
      }
    }
    if (current && line.includes("forms: [")) {
      const formsMatch = line.match(/forms: \[([^\]]*)\]/);
      if (formsMatch) {
        current.forms = formsMatch[1]
          .split(',')
          .map(s => s.trim().replace(/'/g, ''))
          .filter(Boolean);
      }
    }
  }

  return roots;
}

// ── group words by root ────────────────────────────────────────────────────

function buildWordsByRoot(words, roots) {
  const byRoot = {};
  for (const r of roots) byRoot[r.id] = { root: r, words: [] };
  for (const w of words) {
    if (byRoot[w.rootId]) byRoot[w.rootId].words.push(w);
  }
  return byRoot;
}

// ── connotation icon ───────────────────────────────────────────────────────

function connotIcon(c) {
  return c === 'positive' ? '(+)' : c === 'negative' ? '(−)' : '(·)';
}

// ── generate words.html ────────────────────────────────────────────────────

function generateWordsHtml(words, roots, byRoot) {
  const wordsByOrigin = { Latin: [], Greek: [], Other: [], English: [] };
  for (const entry of Object.values(byRoot)) {
    const origin = entry.root.origin;
    if (wordsByOrigin[origin]) wordsByOrigin[origin].push(entry);
  }

  function renderSection(origin, entries) {
    if (!entries.length) return '';
    const blocks = entries
      .filter(e => e.words.length > 0)
      .map(({ root, words: ws }) => {
        const forms = root.forms.length ? root.forms.join(' / ') : root.id;
        const wordItems = ws
          .sort((a, b) => (a.cat ?? 9) - (b.cat ?? 9))
          .map(w => `
      <dt>
        <strong>${w.word}</strong>
        <span class="pos">${w.pos}</span>
        <span class="cat">Cat ${w.cat}</span>
        <span class="con">${connotIcon(w.connotation)}</span>
      </dt>
      <dd>${w.definition}</dd>`)
          .join('');
        return `
    <section class="root-family">
      <h3><span class="root-form">${forms}</span> — "${root.meaning}"
        <small>${root.sourceWord}</small></h3>
      <dl>${wordItems}
      </dl>
    </section>`;
      })
      .join('');

    return `
  <section class="origin-group">
    <h2>${origin} Roots</h2>
    ${blocks}
  </section>`;
  }

  const allWordCount = words.length;
  const totalRoots   = roots.filter(r => byRoot[r.id]?.words.length > 0).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Complete GRE Vocabulary Word List — ${allWordCount} Words by Etymology | Archimedes Lab GRE Prep</title>
  <meta name="description" content="Complete list of ${allWordCount} GRE vocabulary words organized by ${totalRoots} Latin and Greek root families. Each entry includes part of speech, GRE frequency category, connotation, and full definition." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://gre.archimedeslab.com/words.html" />

  <!-- Open Graph -->
  <meta property="og:title" content="Complete GRE Word List — ${allWordCount} Words by Etymology" />
  <meta property="og:description" content="All ${allWordCount} GRE vocabulary words organized by Latin &amp; Greek roots, with definitions and frequency ratings." />
  <meta property="og:url" content="https://gre.archimedeslab.com/words.html" />
  <meta property="og:type" content="website" />

  <!-- Structured data: ItemList of vocabulary words -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "GRE Vocabulary Word List",
    "description": "Complete list of ${allWordCount} GRE vocabulary words organized by etymology",
    "numberOfItems": ${allWordCount},
    "itemListElement": [
      ${words.slice(0, 100).map((w, i) => `{
        "@type": "ListItem",
        "position": ${i + 1},
        "item": {
          "@type": "DefinedTerm",
          "name": "${w.word}",
          "description": "${(w.definition || '').replace(/"/g, '\\"')}"
        }
      }`).join(',\n      ')}
    ]
  }
  </script>

  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem 1rem; color: #1a1a2e; background: #f8f9fa; line-height: 1.6; }
    a { color: #6d28d9; }
    header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0; }
    header h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
    .stats { display: flex; gap: 1.5rem; font-size: 0.9rem; color: #64748b; flex-wrap: wrap; }
    .stat strong { color: #1a1a2e; }
    .origin-group { margin-bottom: 3rem; }
    .origin-group > h2 { font-size: 1.35rem; color: #4c1d95; border-bottom: 2px solid #ede9fe; padding-bottom: 0.4rem; margin-bottom: 1.25rem; }
    .root-family { margin-bottom: 2rem; padding: 1rem 1.25rem; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .root-family h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .root-form { font-family: monospace; background: #ede9fe; color: #5b21b6; padding: 0.1em 0.4em; border-radius: 4px; }
    .root-family h3 small { font-weight: normal; color: #94a3b8; font-size: 0.8em; margin-left: 0.5em; }
    dl { margin: 0; }
    dt { font-weight: 600; margin-top: 0.75rem; display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; }
    dd { margin: 0.15rem 0 0 1rem; color: #475569; font-size: 0.9rem; }
    .pos  { font-size: 0.75rem; color: #94a3b8; font-style: italic; font-weight: normal; }
    .cat  { font-size: 0.7rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 3px; padding: 0.05em 0.35em; color: #64748b; font-weight: normal; }
    .con  { font-size: 0.75rem; color: #94a3b8; font-weight: normal; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <p><a href="/">← Interactive GRE Etymology App</a></p>
    <h1>Complete GRE Vocabulary Word List</h1>
    <p>All ${allWordCount} words organized by their Latin and Greek roots — the most effective way to master GRE vocabulary.</p>
    <div class="stats">
      <span><strong>${allWordCount}</strong> total words</span>
      <span><strong>${totalRoots}</strong> root families</span>
      <span><strong>4</strong> origins: Latin, Greek, Other, English</span>
    </div>
  </header>

  <main>
    ${Object.entries(wordsByOrigin).map(([o, e]) => renderSection(o, e)).join('')}
  </main>

  <footer>
    <p>Generated by <a href="https://archimedeslab.com">Archimedes Lab</a> GRE Prep. Words sourced from Manhattan 5lb, Kaplan GRE, and Magoosh.</p>
    <p>Use the <a href="/">interactive app</a> to study with flashcards, browse root families, and track your progress.</p>
  </footer>
</body>
</html>`;
}

// ── generate sitemap.xml ───────────────────────────────────────────────────

function generateSitemap() {
  const base = 'https://gre.archimedeslab.com';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/',            priority: '1.0', changefreq: 'weekly' },
    { loc: '/#/browse',    priority: '0.9', changefreq: 'weekly' },
    { loc: '/#/flashcards',priority: '0.9', changefreq: 'weekly' },
    { loc: '/#/affixes',   priority: '0.8', changefreq: 'monthly' },
    { loc: '/#/progress',  priority: '0.7', changefreq: 'weekly' },
    { loc: '/#/suggest',   priority: '0.8', changefreq: 'daily' },
    { loc: '/words.html',  priority: '0.9', changefreq: 'weekly' },
  ];

  const urls = staticRoutes.map(r => `
  <url>
    <loc>${base}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ── main ───────────────────────────────────────────────────────────────────

const words = parseWords();
const roots = parseRoots();
const byRoot = buildWordsByRoot(words, roots);

const wordsHtml = generateWordsHtml(words, roots, byRoot);
writeFileSync(join(root, 'public/words.html'), wordsHtml);
console.log(`✓ public/words.html generated (${words.length} words)`);

const sitemap = generateSitemap();
writeFileSync(join(root, 'public/sitemap.xml'), sitemap);
console.log('✓ public/sitemap.xml generated');
