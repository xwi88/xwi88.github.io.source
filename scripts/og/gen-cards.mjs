// Build-time OG social-share card generator.
// Reads public/og-cards.json (emitted by Hugo) and renders a 1200x630 PNG per post
// by composing an SVG and rasterizing it with resvg (handles CJK OTF natively).
// Output: public/og/<out>. Fonts cached in .cache/fonts/.
import { readFile, writeFile, mkdir, existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Resvg } from '@resvg/resvg-js';

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const execFileP = promisify(execFile);
const mkdirP = (p) => promisify(mkdir)(p, { recursive: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PUB = join(ROOT, 'public');
const MANIFEST = join(PUB, 'og-cards.json');
const FONT_DIR = join(__dirname, '.cache', 'fonts');
const OUT_DIR = join(PUB, 'og');

const W = 1200, H = 630;
const FONT_FAMILY = 'Noto Sans CJK SC';
// jsDelivr (not github raw) — it serves Git-LFS content, github raw doesn't.
const FONT_URL = (w) => `https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-${w}.otf`;

async function download(url, dest) {
  // curl is robust with timeouts + resume + retries; fall back to fetch (timeout-guarded).
  try {
    await execFileP('curl', ['-sL', '--connect-timeout', '15', '--max-time', '180',
      '--retry', '4', '--retry-all-errors', '-C', '-', '-o', dest, url]);
    return;
  } catch (_) { /* fall through to fetch */ }
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 180000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFileP(dest, Buffer.from(await res.arrayBuffer()));
  } finally { clearTimeout(to); }
}

async function ensureFonts() {
  await mkdirP(FONT_DIR);
  for (const w of ['Regular', 'Bold']) {
    const file = join(FONT_DIR, `NotoSansSC-${w}.otf`);
    if (!existsSync(file)) {
      process.stdout.write(`og: downloading NotoSansSC ${w}…\n`);
      await download(FONT_URL(w), file);
    }
  }
  return [
    join(FONT_DIR, 'NotoSansSC-Regular.otf'),
    join(FONT_DIR, 'NotoSansSC-Bold.otf'),
  ];
}

// Width-units: CJK/fullwidth ≈ 1, Latin ≈ 0.55, space ≈ 0.3
function charUnits(ch) {
  const c = ch.codePointAt(0) || 0;
  if (c >= 0x3000 && c <= 0x9fff) return 1;        // CJK + CJK punctuation
  if (c >= 0xff00 && c <= 0xffef) return 1;         // fullwidth forms
  if (ch === ' ') return 0.3;
  return 0.55;
}
function wrapTitle(title, maxUnits) {
  const chars = [...title];
  const lines = []; let line = '', u = 0;
  for (const ch of chars) {
    const cu = charUnits(ch);
    if (u + cu > maxUnits && line) { lines.push(line); line = ch; u = cu; if (lines.length === 3) break; }
    else { line += ch; u += cu; }
  }
  if (line && lines.length < 3) lines.push(line);
  return lines;
}

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function svgCard({ title, site, date, tags }) {
  const lines = wrapTitle(title, 22);
  const titleSize = lines.length >= 3 ? 52 : (lines.length === 2 ? 60 : 64);
  const lineH = Math.round(titleSize * 1.28);
  const titleStartY = 300 - Math.round(((lines.length - 1) * lineH) / 2);
  const tspans = lines.map((ln, i) =>
    `<tspan x="76" dy="${i === 0 ? 0 : lineH}">${esc(ln)}</tspan>`
  ).join('');

  const chips = (tags || []).slice(0, 4).map((t) =>
    `<g transform="translate(0,0)"><rect x="0" y="0" width="${30 + t.length * 16}" height="44" rx="22" fill="rgba(255,255,255,0.10)"/><text x="15" y="29" font-family="${FONT_FAMILY}" font-size="22" fill="#c7d2fe">#${esc(t)}</text></g>`
  );
  let chipsX = 76;
  const chipsGroup = (tags || []).slice(0, 4).map((t) => {
    const w = 30 + [...t].length * 16;
    const g = `<g transform="translate(${chipsX},0)"><rect x="0" y="0" width="${w}" height="44" rx="22" fill="rgba(255,255,255,0.10)"/><text x="15" y="29" font-family="${FONT_FAMILY}" font-size="22" fill="#c7d2fe">#${esc(t)}</text></g>`;
    chipsX += w + 12;
    return g;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="55%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${W - 90}" cy="120" r="160" fill="rgba(129,140,248,0.08)"/>
  <circle cx="${W - 40}" cy="${H - 40}" r="120" fill="rgba(96,165,250,0.06)"/>
  <g font-family="${FONT_FAMILY}">
    <g transform="translate(76,118)">
      <circle cx="20" cy="0" r="20" fill="#818cf8"/>
      <text x="56" y="9" font-size="28" fill="#a5b4fc" letter-spacing="2">${esc(site)}</text>
    </g>
    <text x="76" y="${titleStartY}" font-size="${titleSize}" font-weight="700" fill="#ffffff">${tspans}</text>
    <g transform="translate(76,${H - 80})">${chipsGroup}</g>
    ${date ? `<text x="${W - 76}" y="${H - 50}" font-size="24" fill="#94a3b8" text-anchor="end">${esc(date)}</text>` : ''}
  </g>
</svg>`;
}

async function main() {
  if (!existsSync(MANIFEST)) {
    console.error('og: public/og-cards.json not found — run `hugo` first');
    process.exit(1);
  }
  const { site, cards } = JSON.parse(await readFileP(MANIFEST, 'utf8'));
  if (!cards || !cards.length) { console.log('og: no cards in manifest'); return; }
  const fontFiles = await ensureFonts();
  const resvgOpts = {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: false, fontFiles, defaultFontFamily: FONT_FAMILY },
  };
  let n = 0;
  for (const c of cards) {
    const out = join(OUT_DIR, c.out);
    await mkdirP(out.substring(0, out.lastIndexOf('/')));
    const svg = svgCard({ ...c, site });
    const png = new Resvg(svg, resvgOpts).render().asPng();
    await writeFileP(out, png);
    n++;
  }
  console.log(`og: generated ${n} cards into public/og/`);
}

main().catch((e) => { console.error('og error:', e); process.exit(1); });
