# Authoring a bespoke In-Use component (v2 — open canvas)

Each font's In-Use section is a single Astro component at
`src/components/specimen/inuse/<slug>.astro`. When it exists it is the **sole**
source of the In-Use section. It must stand on its own with **4–5 acts** covering
≥4 of the five categories in `docs/in-use-criteria.md` (branding / illustration /
editorial / web & app UI / interactive & experimental).

## Contract / markup skeleton
```astro
---
import type { CollectionEntry } from 'astro:content';
export interface Props { font: CollectionEntry<'fonts'>['data']; }
const { font } = Astro.props;
const fam = font.fontFamily;        // ALWAYS set type in this family
---
<div class="iu" style={`--fam:${fam}`}>
  <figure class="iu__item iu__item--bleed">   <!-- --bleed is optional, per act -->
    <figcaption class="iu__cap">
      <span class="index-num">01</span>
      <span class="label">Editorial — magazine spread</span>
    </figcaption>
    <div class="iu__scene">… your artifact …</div>
    <p class="iu__hint label">optional one-liner on what to try</p>
  </figure>
  … 3–4 more figures …
</div>
<script> /* optional, for interactive scenes */ </script>
<style>
  .iu__scene * { font-family: var(--fam); }
  /* your act styles; you own every surface */
</style>
```
`.index-num` and `.label` are styled globally; number acts 01, 02, 03 … in order.

## The open canvas (what changed from v1)
- **No frames.** The global mat/border/shadow is gone; `.iu__scene` is now a bare
  `container-type: inline-size; overflow: clip` surface. Every pixel of an act is
  yours — paint the full surface (don't rely on a frame to terminate the design).
- **Bleed when the artifact wants it.** `.iu__item--bleed` runs the act edge-to-edge
  of the viewport (captions inside it stay on the page grid automatically). Posters,
  identities, experimental pieces usually bleed; a phone UI usually shouldn't.
- **Design the handoff.** The default stack gap is `clamp(4rem, 10vh, 7.5rem)`;
  override it in your scoped styles (even to 0) to choreograph act-to-act
  transitions — adjacent color fields, a shared horizon line, a scale beat. The
  whole section should read as one sequence.
- `overflow: clip` on `.iu__scene` can be overridden per act if a design needs to
  escape its box — mind neighboring acts if you do.

## Theme tokens (set on the page by the font's palette — USE THESE; hard-code colors
only when an act is intentionally its own surface, e.g. a printed poster or terminal):
`--bg --bg-2 --fg --fg-2 --fg-3 --accent --accent-contrast --line --line-soft`
Spacing `--sp-1..-9`; type scale `--step--1..-4 --display`; `--font-ui --font-mono`;
motion `--ease --ease-out`. Light/dark is handled by tokens — verify both read well.

## Sizing rules
- **UI acts** (dashboards, apps, readers, editors, terminals): size in **real px**
  (12–15px body) so it reads as a true interface, NOT scaled-up; must be interactive
  (sort, input, tabs, drag, toggle). At least one such act per font that plausibly
  serves UI.
- **Print/graphic acts** (posters, spreads, identities, packaging): use container
  queries (`cqi`) so display type scales with the act. `.iu__scene` already has
  `container-type: inline-size`.
- **Responsive = recomposed.** 390 / 768 / 1440 are three compositions, not one
  squished. Tablet (768) is a first-class layout.

## Use the font's actual strengths
Read the frontmatter `axes`, `weights`, `hasItalic`, `openType`, `classification`.
Build acts around them: variable axes → animate or let the user drive; `opsz` →
display vs text contrast; italics/ligatures/alternates/figures → turn the feature ON
via `font-feature-settings` / `font-variation-settings`; mono → tabular alignment,
code, ASCII. **Never claim an axis/feature the font file lacks.**

## Hard requirements
- 4–5 acts; ≥4 distinct categories; font-specific (not portable unchanged).
- Responsive & uncropped at 390/768/1440.
- Reduced-motion safe: non-essential motion inside
  `@media (prefers-reduced-motion: no-preference)` (or disabled in `reduce`).
- Live webfont text only. No images of text. No `innerHTML` (security hook).
- Runtime-created DOM doesn't get Astro's scoped-style attribute — clone a
  `<template>` from the source instead of `createElement` for styled nodes.

## Preview & capture while iterating
- One dev server (already running — NEVER start/stop/restart it):
  `http://localhost:4400/lab/<slug>` renders only the In-Use section, in the exact
  page context (same Section wrapper, so bleeds match production).
- Screenshot: `PORT=4400 node scripts/shoot-inuse.mjs <slug>` →
  `/tmp/specimen-shots/<slug>/scene-NN.png` (1440 desktop, per act) +
  `section-1440.png` / `section-768.png` / `section-390.png` (full stack).
