#!/usr/bin/env node
/**
 * Contrast audit for built output.
 *
 * Walks every button-like element in dist/, resolves the surface it sits on,
 * and checks the fill/text pairing against WCAG AA (4.5:1).
 *
 * A surface is resolved by walking real DOM ancestors, in this order:
 *   1. an explicit data-surface="dark|light" declaration  (always wins)
 *   2. the nearest ancestor with a bg-* utility class
 * A background image alone does not describe a surface, which is why the hero
 * carries data-surface="dark" — see src/pages/index.astro.
 *
 * Palette values are read from src/styles/global.css @theme, so this stays in
 * sync with the tokens rather than hardcoding hexes.
 *
 * Exits non-zero when any surface is UNKNOWN, any pairing fails AA, or any
 * colour fails to resolve — so it works as a CI gate.
 *
 * Usage: npm run audit:contrast
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const THEME = 'src/styles/global.css';
const AA = 4.5;

/* ---------- palette ---------- */
function loadPalette() {
  const css = readFileSync(THEME, 'utf8');
  const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!theme) throw new Error(`no @theme block found in ${THEME}`);
  const map = new Map([['white', '#ffffff'], ['black', '#000000']]);
  for (const m of theme[1].matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})/g)) {
    map.set(m[1], m[2].toLowerCase());
  }
  return map;
}

/* ---------- colour maths (WCAG 2.1) ---------- */
const toRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ---------- class helpers ---------- */
// Only base-state utilities count. `hover:bg-*` / `md:bg-*` are not the
// rest-state fill and must not be read as one.
const base = (re) => new RegExp(`(?<![:\\w-])${re}`);
const FILL = base('bg-([a-z]+-\\d+|white|black)\\b');
const TEXT = base('text-([a-z]+-\\d+|white|black)\\b');
const PAD = /\bp[xy]?-\d/;
const ROUND = /\brounded/;
const DARK_BG = base('bg-(navy-(800|900|950))\\b');
const LIGHT_BG = base('bg-(white|gray-50|gray-100|navy-50|navy-100|green-50|green-100)\\b');

/* ---------- minimal HTML walker ---------- */
const VOID = new Set(['img','br','input','meta','link','hr','path','source','circle','rect','area','col','embed','track','wbr']);

function scanButtons(html) {
  const out = [];
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const [, closing, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
      continue;
    }
    const cls = (attrs.match(/\bclass="([^"]*)"/) || [, ''])[1];
    const surface = (attrs.match(/\bdata-surface="([^"]*)"/) || [, null])[1];

    if ((tag === 'a' || tag === 'button') && FILL.test(cls) && PAD.test(cls) && ROUND.test(cls)) {
      let resolved = null;
      for (let i = stack.length - 1; i >= 0; i--) {
        const a = stack[i];
        if (a.surface) { resolved = { kind: a.surface.toUpperCase(), via: `data-surface="${a.surface}"` }; break; }
        if (DARK_BG.test(a.cls)) { resolved = { kind: 'DARK', via: a.cls.match(DARK_BG)[0] }; break; }
        if (LIGHT_BG.test(a.cls)) { resolved = { kind: 'LIGHT', via: a.cls.match(LIGHT_BG)[0] }; break; }
      }
      // a button may inherit its text colour from an ancestor, as the browser does
      let text = (cls.match(TEXT) || [])[0] ?? null;
      if (!text) {
        for (let i = stack.length - 1; i >= 0; i--) {
          const t = (stack[i].cls.match(TEXT) || [])[0];
          if (t) { text = t; break; }
        }
      }
      out.push({ cls, surface: resolved, text });
    }
    if (!VOID.has(tag) && !attrs.trimEnd().endsWith('/')) stack.push({ tag, cls, surface });
  }
  return out;
}

function walk(dir) {
  const files = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else if (e.endsWith('.html')) files.push(p);
  }
  return files;
}

/* ---------- run ---------- */
let palette;
try { palette = loadPalette(); } catch (e) {
  console.error(`✗ ${e.message}`); process.exit(2);
}

let pages;
try { pages = walk(DIST); } catch {
  console.error(`✗ no ${DIST}/ directory — run \`npm run build\` first.`); process.exit(2);
}
if (!pages.length) { console.error(`✗ no HTML found in ${DIST}/`); process.exit(2); }

const groups = new Map();
for (const file of pages) {
  for (const b of scanButtons(readFileSync(file, 'utf8'))) {
    const fill = (b.cls.match(FILL) || [])[0]?.replace('bg-', '') ?? null;
    const text = b.text ? b.text.replace('text-', '') : null;
    const kind = b.surface?.kind ?? 'UNKNOWN';
    const key = `${fill}|${text}|${kind}`;
    if (!groups.has(key)) groups.set(key, { fill, text, kind, count: 0, pages: new Set(), sample: b.cls });
    const g = groups.get(key);
    g.count++; g.pages.add(file);
  }
}

const rows = [...groups.values()].sort((a, b) => b.count - a.count);
const failures = [];
let skipped = 0;

console.log(`\ncontrast audit — ${rows.reduce((n, r) => n + r.count, 0)} button(s) across ${pages.length} page(s)\n`);
console.log(`${'FILL'.padEnd(12)} ${'TEXT'.padEnd(12)} ${'SURFACE'.padEnd(8)} ${'RATIO'.padStart(8)}  ${'AA'.padEnd(5)} COUNT`);
console.log('-'.repeat(62));

for (const r of rows) {
  const fillHex = r.fill ? palette.get(r.fill) : undefined;
  const textHex = r.text ? palette.get(r.text) : undefined;
  let ratio = null, verdict;

  if (r.kind === 'UNKNOWN') {
    verdict = 'UNKNOWN';
    failures.push(`undeclared surface: ${r.count}x  ${r.sample.slice(0, 70)}\n    fix: add data-surface="dark|light" to the wrapper, or give it a bg-* class`);
  } else if (!r.text) {
    // no own or inherited text colour: not a text-bearing button (link-wrapped
    // card, icon tile). Nothing to evaluate, so it is reported, not failed.
    verdict = 'skip';
    skipped += r.count;
  } else if (!fillHex || !textHex) {
    verdict = 'UNRESOLVED';
    const miss = [!fillHex ? r.fill : null, !textHex ? r.text : null].filter(Boolean).join(', ');
    failures.push(`unresolved colour(s) [${miss}] in ${r.count}x  ${r.sample.slice(0, 60)}\n    fix: add the token to @theme in ${THEME}`);
  } else {
    ratio = contrast(fillHex, textHex);
    const ok = ratio >= AA;
    verdict = ok ? 'pass' : 'FAIL';
    if (!ok) failures.push(`${ratio.toFixed(2)}:1 (needs ${AA}) — text-${r.text} on bg-${r.fill}, ${r.count}x on ${r.kind} surface`);
  }
  console.log(
    `${String(r.fill).padEnd(12)} ${String(r.text).padEnd(12)} ${r.kind.padEnd(8)} ` +
    `${(ratio ? ratio.toFixed(2) + ':1' : '—').padStart(8)}  ${verdict.padEnd(5)} ${r.count}`
  );
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} issue(s):\n`);
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  process.exit(1);
}
console.log(`\n✓ all pairings meet AA (${AA}:1) and every surface is declared` +
  (skipped ? `  (${skipped} non-text element(s) skipped)` : '') + '\n');
