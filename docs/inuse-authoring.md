# Authoring a bespoke In-Use component

Each font's In-Use section is a single Astro component at
`src/components/specimen/inuse/<slug>.astro`. When it exists it is the **sole**
source of the In-Use section (the generic templated scenes are suppressed). So this
file must stand on its own with **≥ 4 examples**.

## Contract / markup skeleton
```astro
---
import type { CollectionEntry } from 'astro:content';
export interface Props { font: CollectionEntry<'fonts'>['data']; }
const { font } = Astro.props;
const fam = font.fontFamily;        // ALWAYS set type in this family
---
<div class="iu" style={`--fam:${fam}`}>
  <figure class="iu__item">
    <figcaption class="iu__cap">
      <span class="index-num">01</span>
      <span class="label">Editorial — magazine spread</span>
    </figcaption>
    <div class="iu__scene">… your artifact …</div>
    <p class="iu__hint label">optional one-liner on what to try</p>
  </figure>
  … ≥3 more figures …
</div>
<script> /* optional, for interactive scenes */ </script>
<style>
  .iu__item { margin: 0; }
  .iu__cap { display:flex; align-items:baseline; gap:.7rem; margin-bottom: var(--sp-2); }
  .iu__hint { margin-top: var(--sp-2); color: var(--fg-3); }
  /* `.iu__scene` framing — copy from inter.astro/ibm-plex-mono.astro for consistency */
  /* ALL type inside must resolve to var(--fam): `.iu__scene * { font-family: var(--fam); }` */
</style>
```
`.index-num` and `.label` are styled globally; number scenes 01, 02, 03 … in order.

## Theme tokens (already set on the page by the font's palette — USE THESE, never hard-code brand colors unless the artifact is intentionally its own surface like a dark terminal):
`--bg --bg-2 --fg --fg-2 --fg-3 --accent --accent-contrast --line --line-soft`
Spacing `--sp-1..-9`; type scale `--step--1..-4 --display`; `--font-ui --font-mono`;
motion `--ease --ease-out`. Light/dark is handled by tokens — verify both read well.

## Sizing rules
- **UI screens** (dashboards, apps, mobile screens, editors, terminals): size in **real px**
  (12–15px body, etc.) so it reads as a true interface, NOT scaled-up. Put the scene in a
  realistic device frame. **At least one** such scene per font that plausibly serves UI,
  and it must be **interactive** (tabs, sort, hover, input, toggle, drag an axis).
- **Print/graphic** (posters, spreads, identities, packaging): use container queries (`cqi`)
  so display type scales with the scene. Set `container-type: inline-size` on the scene.

## Use the font's actual strengths
Read the font's frontmatter `axes`, `weights`, `hasItalic`, `openType`, `classification`.
Build scenes around them: variable axes → animate or let the user drag; `opsz` → display vs
text contrast; italics/ligatures/alternates/figures → turn the OpenType feature ON via
`font-feature-settings` / `font-variation-settings`; mono → tabular alignment, code, ASCII.

## Hard requirements
- ≥4 figures; font-specific (not portable to another face unchanged).
- Responsive & uncropped at 390/768/1440 (use container queries / flexible layouts).
- Reduced-motion safe: wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)`
  or disable in `@media (prefers-reduced-motion: reduce)`.
- Live webfont text only. No images of text.

## Preview & capture while iterating
- Live isolated preview: `http://localhost:4400/lab/<slug>` (only the In-Use scenes).
- Screenshot: `PORT=4400 node scripts/shoot-inuse.mjs <slug>` →
  `/tmp/specimen-shots/<slug>/scene-NN.png` + `section-390.png`.

Reference implementations to match conventions: `inuse/inter.astro` (interactive dashboard +
poster), `inuse/ibm-plex-mono.astro`, `inuse/libre-baskerville.astro`.
