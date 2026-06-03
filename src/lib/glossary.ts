// A curated typographic glossary. Terms get a subtle dotted underline in prose;
// hovering shows the definition and (for visual terms) a little glyph diagram
// rendered with the shared diagram engine.

import type { GuideKey, FocusSpot } from './diagram';

export interface GlossaryEntry {
  term: string;
  definition: string;
  // optional mini-diagram
  glyph?: string;
  guides?: GuideKey[];
  focus?: FocusSpot[];
  family?: string; // force a family that shows the feature well
  // optional styled word sample (for style/lineage terms)
  sample?: string;
  sampleFamily?: string;
}

const SERIF = 'Cormorant Garamond';
const DIDONE = 'Bodoni Moda Variable';

export const glossary: Record<string, GlossaryEntry> = {
  serif: {
    term: 'Serif',
    definition:
      'The small finishing stroke at the end of a letter’s main strokes — the “feet” and “arms”. Serif typefaces have them; sans-serifs (French for “without”) do not.',
    glyph: 'n', family: SERIF, guides: ['baseline'],
    focus: [{ x: 0.1, y: 0.95, r: 0.16 }, { x: 0.9, y: 0.95, r: 0.16, label: 'serif' }],
  },
  'x-height': {
    term: 'x-height',
    definition:
      'The height of the lowercase letters without ascenders or descenders — literally the height of the “x”. A taller x-height usually reads larger and clearer on screen.',
    glyph: 'x', guides: ['cap', 'x', 'baseline'],
  },
  baseline: {
    term: 'Baseline',
    definition: 'The invisible line the letters sit on. Round letters dip very slightly below it to look optically aligned.',
    glyph: 'n', guides: ['baseline'],
  },
  ascender: {
    term: 'Ascender',
    definition: 'The part of a lowercase letter that rises above the x-height, as in b, d, h, k and l.',
    glyph: 'h', guides: ['ascender', 'x', 'baseline'], focus: [{ x: 0.2, y: 0.1, r: 0.16, label: 'ascender' }],
  },
  descender: {
    term: 'Descender',
    definition: 'The part of a letter that drops below the baseline, as in g, j, p, q and y.',
    glyph: 'p', guides: ['baseline', 'descender'], focus: [{ x: 0.22, y: 0.85, r: 0.18, label: 'descender' }],
  },
  counter: {
    term: 'Counter',
    definition: 'The enclosed or partly-enclosed white space inside a letter, like the hole of an o or the loops of a g.',
    glyph: 'o', guides: ['x', 'baseline'], focus: [{ x: 0.5, y: 0.5, r: 0.22, label: 'counter' }],
  },
  bowl: {
    term: 'Bowl',
    definition: 'The curved stroke that encloses a counter, as in b, d, o and p.',
    glyph: 'b', family: SERIF, guides: ['x', 'baseline'], focus: [{ x: 0.62, y: 0.62, r: 0.24, label: 'bowl' }],
  },
  aperture: {
    term: 'Aperture',
    definition: 'The opening where a curved letter doesn’t fully close — the gap in a c, e or s. Open apertures help legibility at small sizes.',
    glyph: 'c', family: SERIF, guides: ['x', 'baseline'], focus: [{ x: 0.86, y: 0.5, r: 0.2, label: 'aperture' }],
  },
  terminal: {
    term: 'Terminal',
    definition: 'The end of a stroke that has no serif — it can be cut flat, tapered, or finished with a round “ball”.',
    glyph: 'a', family: SERIF, guides: ['x', 'baseline'], focus: [{ x: 0.78, y: 0.16, r: 0.16, label: 'terminal' }],
  },
  'ball terminal': {
    term: 'Ball terminal',
    definition: 'A stroke that ends in a small circular blob rather than a point — a hallmark flourish of Didone and many display serifs.',
    glyph: 'f', family: DIDONE, guides: ['ascender', 'x', 'baseline'], focus: [{ x: 0.66, y: 0.05, r: 0.13, label: 'ball' }],
  },
  stem: {
    term: 'Stem',
    definition: 'The main vertical or diagonal stroke of a letter — its load-bearing “spine”.',
    glyph: 'n', guides: ['x', 'baseline'], focus: [{ x: 0.12, y: 0.5, r: 0.14, label: 'stem' }],
  },
  contrast: {
    term: 'Contrast',
    definition: 'The difference between a letter’s thick and thin strokes. Low contrast feels even and sturdy; high contrast feels elegant and dramatic.',
    glyph: 'o', family: DIDONE, guides: ['x', 'baseline'],
    focus: [{ x: 0.5, y: 0.07, r: 0.1, label: 'thin' }, { x: 0.92, y: 0.5, r: 0.12, label: 'thick' }],
  },
  stress: {
    term: 'Stress',
    definition: 'The direction of a round letter’s thinnest points — its axis. A vertical axis feels modern and rational; a slanted one recalls the broad-nib pen.',
    glyph: 'o', family: SERIF, guides: ['x', 'baseline'],
    focus: [{ x: 0.5, y: 0.06, r: 0.12 }, { x: 0.5, y: 0.94, r: 0.12, label: 'axis' }],
  },
  hairline: {
    term: 'Hairline',
    definition: 'The very thinnest stroke in a high-contrast typeface — so fine it can vanish at small sizes.',
    glyph: 'o', family: DIDONE, guides: ['x', 'baseline'], focus: [{ x: 0.5, y: 0.07, r: 0.12, label: 'hairline' }],
  },
  ear: {
    term: 'Ear',
    definition: 'The small stroke that projects from the top-right of a double-storey lowercase g — a quiet place for personality.',
    glyph: 'g', family: SERIF, guides: ['x', 'baseline'], focus: [{ x: 0.64, y: 0.1, r: 0.11, label: 'ear' }],
  },
  ligature: {
    term: 'Ligature',
    definition: 'A single glyph made by joining two or more letters that would otherwise collide, such as fi and fl.',
    sample: 'fi fl ffi', sampleFamily: SERIF,
  },
  kerning: {
    term: 'Kerning',
    definition: 'Adjusting the space between specific letter pairs (like AV or To) so the spacing looks even.',
    sample: 'AVA To Wa', sampleFamily: SERIF,
  },
  tracking: {
    term: 'Tracking',
    definition: 'Uniform letter-spacing applied across a run of text, as opposed to kerning’s pair-by-pair tuning.',
    sample: 'S P A C E D', sampleFamily: SERIF,
  },
  leading: {
    term: 'Leading',
    definition: 'The vertical space between lines of type — named for the strips of lead once placed between rows of metal type.',
  },
  grotesque: {
    term: 'Grotesque',
    definition: 'The first sans-serifs of the 19th century. Sturdy and a little irregular, with some stroke-weight variation — the ancestors of Helvetica.',
    sample: 'Grotesque', sampleFamily: 'Space Grotesk Variable',
  },
  'neo-grotesque': {
    term: 'Neo-grotesque',
    definition: 'The mid-20th-century refinement of the grotesque: cleaner, more even, more neutral. Helvetica and Inter live here.',
    sample: 'Neutral', sampleFamily: 'Inter Variable',
  },
  geometric: {
    term: 'Geometric',
    definition: 'A sans-serif built from near-perfect circles and straight lines, in the spirit of the Bauhaus. Futura is the archetype.',
    sample: 'GEOMETRIC', sampleFamily: 'Jost Variable',
  },
  humanist: {
    term: 'Humanist',
    definition: 'A typeface that keeps the traces of the hand — calligraphic stroke modulation and pen-made proportions — whether serif or sans.',
    sample: 'Humanist', sampleFamily: 'Source Sans 3 Variable',
  },
  'old-style': {
    term: 'Old-style',
    definition: 'The Renaissance serif tradition (Garalde): low, gentle contrast, a slanted stress, and bracketed serifs. Garamond is the classic.',
    sample: 'Old-style', sampleFamily: SERIF,
  },
  transitional: {
    term: 'Transitional',
    definition: 'The 18th-century bridge between old-style and modern: higher contrast and a more upright, rational stress. Baskerville defines it.',
    sample: 'Transitional', sampleFamily: 'Libre Baskerville',
  },
  didone: {
    term: 'Didone',
    definition: 'The neoclassical “modern” serif of the late 1700s — extreme thick-to-thin contrast, vertical stress and flat, unbracketed serifs. Bodoni and Didot.',
    sample: 'Didone', sampleFamily: DIDONE,
  },
  'slab serif': {
    term: 'Slab serif',
    definition: 'A 19th-century industrial serif with heavy, block-like serifs — built to shout from posters and advertisements. Also called Egyptian.',
    sample: 'Slab', sampleFamily: 'Besley Variable',
  },
  monospace: {
    term: 'Monospace',
    definition: 'A typeface in which every character occupies the same fixed width, so columns of text — and code — line up perfectly.',
    sample: 'i l m W', sampleFamily: 'IBM Plex Mono',
  },
  'optical size': {
    term: 'Optical size',
    definition: 'Cutting a typeface differently for different sizes — finer and tighter for display, sturdier and more open for small text. A variable-font axis revives the idea.',
  },
  'variable font': {
    term: 'Variable font',
    definition: 'A single font file that contains a continuous range of styles along one or more “axes” (weight, width, optical size…), set live in the browser.',
  },
};

/** Look up a glossary entry by loose key. */
export function lookup(key: string): GlossaryEntry | undefined {
  return glossary[key.toLowerCase().trim()];
}
