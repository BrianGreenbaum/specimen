// Accurate, runtime font-metric measurement via the Canvas TextMetrics API.
// No font-parsing dependencies: we render to an offscreen canvas and read back
// the real ascent/descent/advance for the actual font + glyph being shown.
// All returned values are normalised to the em (fractions of font-size).

export interface GlyphMetrics {
  capHeight: number; // top of capitals above baseline (em)
  xHeight: number; // top of lowercase x above baseline (em)
  ascender: number; // font ascent (em) — top of the em box
  descender: number; // font descent (em, positive) — bottom of the em box
  glyphAscent: number; // this glyph's ink top above baseline (em)
  glyphDescent: number; // this glyph's ink below baseline (em, positive)
  advance: number; // advance width (em)
  leftBearing: number; // left side bearing (em)
  rightBearing: number; // right side bearing (em)
}

let _canvas: HTMLCanvasElement | null = null;
function ctx(): CanvasRenderingContext2D {
  if (!_canvas) _canvas = document.createElement('canvas');
  return _canvas.getContext('2d')!;
}

const SIZE = 200; // measure large for precision

function measureChar(c: CanvasRenderingContext2D, ch: string) {
  return c.measureText(ch);
}

/** Ensure the font is loaded at a weight before measuring. */
export async function ensureFont(family: string, weight = 400): Promise<void> {
  try {
    await document.fonts.load(`${weight} ${SIZE}px "${family.replace(/"/g, '')}"`, 'Hxap');
    await document.fonts.ready;
  } catch {
    /* best effort */
  }
}

export function measureGlyph(family: string, glyph: string, weight = 400): GlyphMetrics {
  const c = ctx();
  c.font = `${weight} ${SIZE}px "${family.replace(/"/g, '')}"`;
  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';

  const H = measureChar(c, 'H');
  const x = measureChar(c, 'x');
  const asc = measureChar(c, 'd'); // tall ascender reference
  const desc = measureChar(c, 'p'); // descender reference
  const g = measureChar(c, glyph || 'A');

  const em = SIZE;
  const capHeight = H.actualBoundingBoxAscent / em;
  const xHeight = x.actualBoundingBoxAscent / em;
  // Prefer real font box for the em extents, fall back to measured glyph extents.
  const ascender =
    (H.fontBoundingBoxAscent || Math.max(asc.actualBoundingBoxAscent, H.actualBoundingBoxAscent)) /
    em;
  const descender =
    (desc.fontBoundingBoxDescent || desc.actualBoundingBoxDescent) / em;

  const advance = g.width / em;
  const leftBearing = (g.actualBoundingBoxLeft ?? 0) / em;
  const rightBearing = (g.width - (g.actualBoundingBoxRight ?? g.width)) / em;

  return {
    capHeight,
    xHeight,
    ascender,
    descender,
    glyphAscent: g.actualBoundingBoxAscent / em,
    glyphDescent: g.actualBoundingBoxDescent / em,
    advance,
    leftBearing,
    rightBearing,
  };
}
