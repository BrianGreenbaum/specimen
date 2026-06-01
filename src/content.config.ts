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

const callout = z.object({
  glyph: z.string(),        // the character(s) to enlarge
  title: z.string(),        // the feature name
  body: z.string(),         // what makes it distinctive
});

const inUseScene = z.object({
  kind: z.enum([
    'poster', 'editorial', 'app-ui', 'terminal', 'invitation',
    'article', 'magazine', 'brand', 'data',
  ]),
  label: z.string(),        // caption, e.g. 'Editorial — magazine spread'
});

const fonts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/fonts' }),
  schema: z.object({
    name: z.string(),
    order: z.number().default(99),
    designer: z.string(),
    foundry: z.string().optional(),
    year: z.number(),
    classification: z.string(),         // e.g. 'Grotesque Sans'
    category: z.enum(['Sans', 'Serif', 'Display', 'Monospace']),
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

export const collections = { fonts };
