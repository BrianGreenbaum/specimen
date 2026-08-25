// Build-time Open-Graph card generation.
// One 1200×630 SVG per face: the font's own theme palette as the ground,
// a real glyph outline (decoded from the font binary via the outlines lib),
// and the specimen identity line. SVGs are inlined into the page head —
// social scrapers that render SVG will show the true letterform, and every
// browser gets a crisp icon-quality preview either way.
//
// Kept dependency-free and synchronous-ish: it reuses getOutlines() which is
// already computed for the specimen page, so there is zero extra font parsing.

import type { FontOutlines } from './outlines';
import type { CollectionEntry } from 'astro:content';

export interface OgCard {
  svg: string; // full <svg> document
}

const W = 1200;
const H = 630;

/** Build an SVG path string from an OutlineGlyph at a given weight stop. */
function glyphPath(data: FontOutlines, char: string, wght: number): { d: string; adv: number } | null {
  const g = data.glyphs.find((x) => x.char === char);
  if (!g || g.instances.length === 0) return null;
  // nearest sampled instance
  let best = g.instances[0];
  for (const inst of g.instances) {
    if (Math.abs(inst.w - wght) < Math.abs(best.w - wght)) best = inst;
  }
  const upm = data.upm;
  const scale = H * 0.62 / upm; // glyph cap fills ~62% of card height
  // walk the command template with the instance coordinates
  let d = '';
  let ci = 0;
  for (const cmd of g.cmds) {
    switch (cmd) {
      case 'M': d += `M${rnd(best.coords[ci]! * scale)},${rnd(-best.coords[ci + 1]! * scale)} `; ci += 2; break;
      case 'L': d += `L${rnd(best.coords[ci]! * scale)},${rnd(-best.coords[ci + 1]! * scale)} `; ci += 2; break;
      case 'Q': d += `Q${rnd(best.coords[ci]! * scale)},${rnd(-best.coords[ci + 1]! * scale)} ${rnd(best.coords[ci + 2]! * scale)},${rnd(-best.coords[ci + 3]! * scale)} `; ci += 4; break;
      case 'C': d += `C${rnd(best.coords[ci]! * scale)},${rnd(-best.coords[ci + 1]! * scale)} ${rnd(best.coords[ci + 2]! * scale)},${rnd(-best.coords[ci + 3]! * scale)} ${rnd(best.coords[ci + 4]! * scale)},${rnd(-best.coords[ci + 5]! * scale)} `; ci += 6; break;
      case 'Z': d += 'Z '; break;
    }
  }
  return { d, adv: best.adv * scale };
}
const rnd = (n: number) => Math.round(n * 10) / 10;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function buildOgCard(
  font: CollectionEntry<'fonts'>['data'],
  data: FontOutlines | null
): Promise<OgCard | null> {
  const t = font.theme;

  // choose the signature glyph: first anatomy callout that exists, else 'R'
  const want = font.callouts.map((c) => c.glyph).find((g) => [...g].length === 1 && data?.glyphs.some((x) => x.char === g));
  const char = want ?? data?.glyphs[0]?.char ?? null;
  const wght = font.isVariable ? (font.axes.find((a) => a.tag === 'wght')?.default ?? 400) : 400;
  const path = data && char ? glyphPath(data, char, wght) : null;

  const ink = t.fg;
  const accent = t.accent;
  const bg = t.bg;
  const bg2 = t.bg2;

  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  parts.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  // quiet second-tone field behind the glyph
  parts.push(`<circle cx="${W * 0.72}" cy="${H * 0.44}" r="${H * 0.42}" fill="${bg2}"/>`);

  if (path) {
    parts.push(
      `<g transform="translate(${W * 0.56 - (path.adv * 0.35)}, ${H * 0.86})">` +
        `<path d="${path.d}" fill="none" stroke="${accent}" stroke-width="3" stroke-linejoin="round"/>` +
      `</g>`
    );
    // ghost fill of the same letter, very low alpha
    parts.push(
      `<g transform="translate(${W * 0.56 - (path.adv * 0.35)}, ${H * 0.86})" opacity="0.14">` +
        `<path d="${path.d}" fill="${ink}"/>` +
      `</g>`
    );
  }

  // identity block, bottom-left
  parts.push(`<text x="${W * 0.075}" y="${H * 0.82}" fill="${ink}" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="600">${esc(font.name)}</text>`);
  parts.push(`<text x="${W * 0.078}" y="${H * 0.9}" fill="${ink}" opacity="0.66" font-family="Menlo, Consolas, monospace" font-size="26" letter-spacing="2">${esc(`${font.category.toUpperCase()} · ${font.designer.toUpperCase()} · ${font.year}`)}</text>`);

  // corner index mark
  parts.push(`<text x="${W * 0.075}" y="${H * 0.16}" fill="${accent}" font-family="Menlo, Consolas, monospace" font-size="30" letter-spacing="4">${esc(String(font.order).padStart(2, '0'))}</text>`);
  parts.push('</svg>');

  return { svg: parts.join('') };
}
