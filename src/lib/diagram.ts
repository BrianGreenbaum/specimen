// Shared SVG glyph-diagram renderer.
// Draws a glyph with metric-accurate baseline / x-height / cap-height /
// ascender / descender guides, an optional advance-width box, and optional
// "spotlight" highlights that light up a specific feature (serif, terminal,
// bowl…) by revealing an accent-coloured copy of the glyph through a mask.
//
// Used by the glyph inspector, the anatomy callouts, and the glossary popovers.
// Built with explicit DOM nodes (no innerHTML) — all content is author-controlled.

import { measureGlyph, ensureFont } from './metrics';

export type GuideKey = 'ascender' | 'cap' | 'x' | 'baseline' | 'descender';

export interface FocusSpot {
  x: number; // 0–1 across the glyph ink box
  y: number; // 0–1 down the glyph ink box
  r: number; // radius as a fraction of the ink box height
  label?: string;
}

export interface DiagramOptions {
  family: string;
  glyph: string;
  weight?: number;
  guides?: GuideKey[];
  focus?: FocusSpot[];
  showAdvance?: boolean;
  advanceLabel?: boolean; // draw the "advance NNN" text inside the SVG (default: follows showAdvance)
  showGuideLabels?: boolean; // text labels on the metric guides (inspector)
  fill?: number; // 0–1 fraction of the field height the type should occupy
}

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 1000;
const H = 1000;
const MX = 70; // left margin for guide lines
const LABEL_W = 205; // reserved space on the right for guide labels

const GUIDE_LABEL: Record<GuideKey, string> = {
  ascender: 'ascender',
  cap: 'cap height',
  x: 'x-height',
  baseline: 'baseline',
  descender: 'descender',
};

function node(tag: string, attrs: Record<string, string | number> = {}, text?: string): SVGElement {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (text != null) e.textContent = text;
  return e as SVGElement;
}

export async function renderGlyphDiagram(svg: SVGElement, opts: DiagramOptions): Promise<void> {
  const {
    family,
    glyph,
    weight = 400,
    guides = [],
    focus = [],
    showAdvance = false,
    advanceLabel,
    showGuideLabels = false,
    fill = 0.6,
  } = opts;
  const drawAdvanceText = advanceLabel ?? showAdvance;

  await ensureFont(family, weight);
  const m = measureGlyph(family, glyph, weight);

  const typeHeight = m.ascender + m.descender || 1;
  const FS = (fill * H) / typeHeight;
  const cx = guides.length && showGuideLabels ? (MX + (W - LABEL_W)) / 2 : W / 2;
  const emTop = H / 2 - (typeHeight * FS) / 2;
  const baselineY = emTop + m.ascender * FS;

  const yOf: Record<GuideKey, number> = {
    ascender: baselineY - m.ascender * FS,
    cap: baselineY - m.capHeight * FS,
    x: baselineY - m.xHeight * FS,
    baseline: baselineY,
    descender: baselineY + m.descender * FS,
  };

  const advL = cx - (m.advance * FS) / 2;
  const inkL = advL + m.leftBearing * FS;
  const inkR = cx + (m.advance * FS) / 2 - m.rightBearing * FS;
  const inkT = baselineY - m.glyphAscent * FS;
  const inkB = baselineY + m.glyphDescent * FS;
  const inkW = Math.max(1, inkR - inkL);
  const inkH = Math.max(1, inkB - inkT);

  const uid = `spot-${family.replace(/\W/g, '')}-${glyph.codePointAt(0) ?? 0}`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const spots = focus.map((f) => ({
    sx: inkL + f.x * inkW,
    sy: inkT + f.y * inkH,
    sr: f.r * inkH,
    label: f.label,
  }));

  // mask for the accent spotlight
  if (spots.length) {
    const defs = node('defs');
    const mask = node('mask', { id: uid });
    mask.appendChild(node('rect', { x: 0, y: 0, width: W, height: H, fill: 'black' }));
    for (const s of spots) mask.appendChild(node('circle', { cx: s.sx, cy: s.sy, r: s.sr, fill: 'white' }));
    defs.appendChild(mask);
    svg.appendChild(defs);
  }

  // guides
  const lineRight = showGuideLabels ? W - LABEL_W : W - MX;
  for (const g of guides) {
    const y = yOf[g];
    const line = node('line', {
      class: g === 'baseline' ? 'dg-guide dg-guide--base' : 'dg-guide',
      x1: MX, y1: y, x2: lineRight, y2: y,
    });
    if (g !== 'baseline') line.setAttribute('stroke-dasharray', '2 7');
    svg.appendChild(line);
    if (showGuideLabels) {
      svg.appendChild(
        node('text', { class: 'dg-glabel', x: lineRight + 16, y, 'dominant-baseline': 'middle' }, GUIDE_LABEL[g])
      );
    }
  }

  // advance-width box
  if (showAdvance) {
    svg.appendChild(node('line', { class: 'dg-adv', x1: advL, y1: emTop - 24, x2: advL, y2: inkB + 60 }));
    svg.appendChild(node('line', { class: 'dg-adv', x1: advL + m.advance * FS, y1: emTop - 24, x2: advL + m.advance * FS, y2: inkB + 60 }));
    if (drawAdvanceText) {
      svg.appendChild(
        node('text', { class: 'dg-glabel', x: cx, y: inkB + 96, 'text-anchor': 'middle' }, `advance ${Math.round(m.advance * 1000)} units/em`)
      );
    }
  }

  // base glyph
  const base = node('text', {
    class: spots.length ? 'dg-glyph dg-glyph--muted' : 'dg-glyph',
    x: cx, y: baselineY, 'font-size': FS, 'text-anchor': 'middle',
  }, glyph);
  base.setAttribute('style', `font-family:'${family}';font-weight:${weight}`);
  svg.appendChild(base);

  // accent glyph through the spotlight mask
  if (spots.length) {
    const acc = node('text', {
      class: 'dg-glyph dg-glyph--accent', x: cx, y: baselineY, 'font-size': FS,
      'text-anchor': 'middle', mask: `url(#${uid})`,
    }, glyph);
    acc.setAttribute('style', `font-family:'${family}';font-weight:${weight}`);
    svg.appendChild(acc);
    for (const s of spots) {
      svg.appendChild(node('circle', { class: 'dg-ring', cx: s.sx, cy: s.sy, r: s.sr, fill: 'none' }));
      if (s.label) {
        svg.appendChild(node('text', { class: 'dg-flabel', x: s.sx, y: s.sy - s.sr - 16, 'text-anchor': 'middle' }, s.label));
      }
    }
  }
}
