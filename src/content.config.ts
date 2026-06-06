import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const axis = z.object({
  tag: z.string(),          // e.g. 'wght', 'opsz', 'SOFT', 'WONK'
  name: z.string(),         // human label, e.g. 'Weight'
  min: z.number(),
  max: z.number(),
  default: z.number(),
  step: z.number().default(1),
});

const styleEntry = z.object({
  name: z.string(),         // e.g. 'Regular', 'Bold Italic'
  weight: z.number(),       // 100–900
  italic: z.boolean().default(false),
});

const otFeature = z.object({
  tag: z.string(),          // e.g. 'liga', 'ss01', 'tnum'
  label: z.string(),        // human label
  sample: z.string(),       // text that demonstrates it
  on: z.boolean().default(false),
});

const focusSpot = z.object({
  x: z.number(),            // 0–1 across the glyph ink box
  y: z.number(),            // 0–1 down the glyph ink box
  r: z.number().default(0.18), // radius as fraction of ink-box height
  label: z.string().optional(),
  // Optional label offset from the spot centre (× ink-box height). Omitted →
  // label sits centred just above the ring. Set via the Glyph edit tool.
  lx: z.number().optional(),
  ly: z.number().optional(),
});

const callout = z.object({
  glyph: z.string(),        // the character(s) to enlarge
  title: z.string(),        // the feature name
  body: z.string(),         // what makes it distinctive
  weight: z.number().default(400),
  guides: z.array(z.enum(['ascender', 'cap', 'x', 'baseline', 'descender'])).default([]),
  focus: z.array(focusSpot).default([]),  // spotlight highlights on the feature
});

const inUseScene = z.object({
  kind: z.enum([
    'poster', 'editorial', 'app-ui', 'terminal', 'invitation',
    'article', 'magazine', 'brand', 'data',
    // Graphic / motion scenes — type as the artwork, not just text in a box.
    'kinetic', 'orbit', 'marquee', 'overprint',
  ]),
  label: z.string(),        // caption, e.g. 'Editorial — magazine spread'
  // For kind:'brand' — pick a BrandScene layout. Omitted → chosen deterministically.
  variant: z.enum(['wordmark', 'monogram', 'seal', 'stack', 'grid']).optional(),
  // Optional word/short phrase override for the graphic scenes (defaults to headline/name).
  word: z.string().optional(),
});

const fonts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/fonts' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(99),
    era: z.string().optional(),          // slug of the era this face belongs to
    historyNote: z.string().optional(),  // one line on its place in history
    designer: z.string(),
    foundry: z.string().optional(),
    year: z.number(),
    classification: z.string(),         // e.g. 'Grotesque Sans'
    category: z.enum(['Sans', 'Serif', 'Display', 'Monospace', 'Slab']),
    blurb: z.string(),                   // one-line positioning
    googleFontsUrl: z.string().url(),
    sourceUrl: z.string().url().optional(),
    license: z.string().default('SIL Open Font License 1.1'),

    // rendering
    fontFamily: z.string(),             // CSS family, e.g. 'Inter Variable'
    isVariable: z.boolean(),
    axes: z.array(axis).default([]),
    weights: z.array(styleEntry),
    hasItalic: z.boolean().default(false),

    // specimen content
    headline: z.string(),               // hero word/phrase
    sampleText: z.string(),             // tester default
    pangram: z.string().default('The quick brown fox jumps over the lazy dog'),
    feelings: z.array(z.string()).default([]),   // meta chips
    languages: z.array(z.string()).default([]),
    pairsWith: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
    openType: z.array(otFeature).default([]),
    callouts: z.array(callout).default([]),
    inUse: z.array(inUseScene).default([]),

    // per-font theme (palette only; semantic roles derive in global.css)
    theme: z.object({
      mode: z.enum(['light', 'dark']).default('light'),
      bg: z.string(),
      bg2: z.string(),
      fg: z.string(),
      fg2: z.string(),
      fg3: z.string(),
      accent: z.string(),
      accentContrast: z.string(),
      line: z.string(),
      lineSoft: z.string(),
    }),
  }),
});

const eras = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/eras' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    slug: z.string(),
    period: z.string(),                  // e.g. '1450–1500'
    yearAnchor: z.number(),              // for timeline positioning
    oneLiner: z.string(),
    evolution: z.string().default(''),   // what happened to the letterform here
    sample: z.string().default('Handgloves'),
    // a representative font for the evolution scrubber + chapter showings
    specimenFont: z.object({ family: z.string(), weight: z.number().default(400) }),
    // Where this era sits on four letterform dimensions (0–1). Drives the
    // animated "what changes" readout in the Evolution scrubber.
    traits: z.object({
      serif: z.number().min(0).max(1),      // 0 none/sans → 1 heavy slab
      contrast: z.number().min(0).max(1),   // 0 monoline → 1 extreme thick/thin
      stress: z.number().min(0).max(1),     // 0 vertical/none → 1 diagonal humanist
      terminals: z.number().min(0).max(1),  // 0 blunt/cut → 1 ball/flared
    }).optional(),
    // Accent spotlights drawn on the letter in the scrubber (pinned to one glyph).
    spotlightGlyph: z.string().default('R'),
    spotlightFocus: z.array(focusSpot).default([]),
    // Annotated glyph plates shown on the era chapter ("traits, drawn").
    traitCallouts: z.array(callout).default([]),
    characteristics: z.array(z.object({ term: z.string(), detail: z.string() })).default([]),
    keyFigures: z.array(z.object({ name: z.string(), note: z.string() })).default([]),
    // Editorial, long-form people profiles ("portraits as typography").
    // Supersedes keyFigures on the chapter when present; keyFigures stays as fallback.
    people: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),          // 'Punchcutter · Venice'
      dates: z.string().optional(),         // '1420–1480'
      place: z.string().optional(),
      initial: z.string().optional(),       // glyph used as the portrait (defaults to name[0])
      portraitFamily: z.string().optional(),// family for the big initial (defaults to specimenFont.family)
      quote: z.string().optional(),
      story: z.string(),                    // 1–2 paragraph bio
    })).default([]),
    // Faces shown in the chapter timeline that have NO specimen page.
    // family must be imported in Layout.astro.
    timelineFaces: z.array(z.object({
      name: z.string(),
      family: z.string(),
      weight: z.number().default(400),
      designer: z.string().optional(),
      year: z.string().optional(),          // string to allow ranges / 'c. 1470'
      note: z.string().optional(),
    })).default([]),
    // Hero epigraph (editorial pull quote).
    epigraph: z.object({ text: z.string(), attribution: z.string().optional() }).optional(),
    // Optional override for the "what changed since last era" headline copy.
    diffNote: z.string().optional(),
    fonts: z.array(z.string()).default([]),   // slugs of specimens in this era
    theme: z.object({
      bg: z.string(), fg: z.string(), accent: z.string(),
    }),
  }),
});

export const collections = { fonts, eras };
