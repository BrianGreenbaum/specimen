# Specimen

A living library of beautiful, in-depth, interactive type specimens for open-source
Google Fonts. Built with [Astro](https://astro.build), self-hosted fonts, and a lot of
care. Each specimen has a giant showing, a live type tester wired to every variable
axis, a weights showcase, a size waterfall, annotated letterform anatomy, hand-built
"in use" scenes, a full glyph set, OpenType demos, and a researched editorial story.

```bash
npm install      # install Astro + the @fontsource font packages
npm run dev      # local dev server at http://localhost:4321
npm run build    # static output to dist/
npm run preview  # preview the built site
```

## How it's organised

```
src/
├─ content/fonts/<slug>.mdx     ← ONE file per typeface: metadata (frontmatter) + story (body)
├─ content/eras/<slug>.mdx      ← ONE file per type-history era (the /history chapters)
├─ content.config.ts            ← the schemas every font + era file is validated against
├─ pages/
│  ├─ index.astro               ← the gallery / index
│  ├─ fonts/[slug].astro        ← the specimen template (one page per font, auto-generated)
│  └─ history/                  ← the History of Typography hub + per-era chapters
├─ components/specimen/         ← the reusable specimen sections (Hero, TypeTester, …)
│  └─ inuse/<slug>.astro        ← OPTIONAL bespoke In-Use scenes for a font (falls back to InUse.astro)
├─ components/history/          ← the evolution scrubber + history pieces
├─ components/Glossary.astro    ← auto-links typographic terms → hover definitions
├─ layouts/Layout.astro         ← base HTML shell; imports every self-hosted font
├─ lib/                         ← metrics (Canvas), glyph diagram, glyph sets, corpus, glossary, theme
└─ styles/global.css            ← design tokens, type scale, grid, motion, shared diagram + in-use CSS
```

### The History of Typography
`/history` is an interactive timeline (the letterform-evolution scrubber) plus one designed
chapter per era. Eras are a content collection just like fonts: add `src/content/eras/<slug>.mdx`
(see `content.config.ts` for the schema) and list a font's `era:` slug in its frontmatter to wire
the bidirectional links (era → its faces, and each specimen → its era band).

### Bespoke In-Use scenes
Each font may have its own `src/components/specimen/inuse/<slug>.astro` for unique, art-directed
"in use" scenes. The route renders it automatically if present, else falls back to the generic
`InUse.astro`. Keep functional/UI mockups at realistic px sizes; posters can scale with `cqi`.

The guiding principle: **one font = one content file + its font package.** Everything
else (layout, components, interactivity, responsiveness) is shared.

## Adding a new font (≈ 3 steps)

1. **Install the font** from Fontsource (variable preferred):

   ```bash
   npm install @fontsource-variable/<name>   # variable font
   # or
   npm install @fontsource/<name>            # static font
   ```

2. **Load it** by adding one import line in `src/layouts/Layout.astro`
   (use the `.css` variant that exposes the axes you want, e.g. `full.css`/`opsz.css`):

   ```js
   import '@fontsource-variable/<name>/index.css';
   ```

3. **Describe it** by creating `src/content/fonts/<slug>.mdx`. Copy an existing file as a
   template — `inter.mdx` (variable) or `libre-baskerville.mdx` (static) are good starts.
   Fill in the frontmatter (designer, year, axes, weights, theme palette, callouts,
   in-use scenes, OpenType features…) and write the story in the MDX body.

That's it. The index row, the specimen page, the tester, the waterfall, the glyph grid
and the per-font colour theme are all generated automatically from that one file.

### The frontmatter at a glance

`content.config.ts` is the source of truth, but the important fields are:

- **Identity** — `name`, `order`, `designer`, `foundry`, `year`, `classification`, `category`, `blurb`.
- **Rendering** — `fontFamily` (the CSS family, e.g. `'Inter Variable'`), `isVariable`,
  `axes[]` (variable only), `weights[]`, `hasItalic`.
- **Specimen content** — `headline`, `sampleText`, `pangram`, `feelings[]`, `languages[]`,
  `pairsWith[]`, `openType[]`, `callouts[]` (the anatomy zoom-ins), `inUse[]` (the scenes).
- **Theme** — a small palette (`bg`, `fg`, `accent`, …) that recolours the whole page to
  the typeface's mood. Set `mode: 'light' | 'dark'`.

### In-use scene kinds

The `inUse[]` scenes are hand-built CSS/SVG layouts that render the **real webfont** as
live text. Available `kind`s (add more in `components/specimen/InUse.astro`):
`brand`, `app-ui`, `data`, `terminal`, `invitation`, `editorial`, `poster`, `magazine`,
`article`.

## The collection

Inter · Fraunces · Space Grotesk · IBM Plex Mono · Playfair Display · Libre Baskerville ·
Cormorant Garamond. Every face is free and open source under its own licence.
