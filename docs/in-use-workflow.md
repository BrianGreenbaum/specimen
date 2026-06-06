# Workflow — creating In-Use examples (and new specimens) at the bar

This is the repeatable process used to build every font's In-Use section to an
award-tier standard, and to add new faces. Pair it with the two companion docs:
- `docs/in-use-criteria.md` — the scoring **rubric** (what "good" means).
- `docs/inuse-authoring.md` — the component **contract** (how to build a scene).

The core idea: an **adversarial creator/critic loop**, judged on **rendered
screenshots**, not on code or self-assessment. Nothing ships below **90/100**.

## 0. One-time harness
- **Isolation route** `src/pages/lab/[slug].astro` renders ONLY a font's In-Use
  scenes (no header/hero/etc.), and builds to **zero** production pages (its
  `getStaticPaths` returns `[]` unless `import.meta.env.DEV`). Fast, focused.
- **Capture script** `scripts/shoot-inuse.mjs` (puppeteer-core, points at the
  installed Chrome) shoots cropped per-scene PNGs + a 390px mobile shot to
  `/tmp/specimen-shots/<slug>/`. Usage: `PORT=4400 node scripts/shoot-inuse.mjs <slug...>`.
- Run **one** dev server: `npm run dev -- --port 4400` (background). Keep it the
  single source — see Gotchas.

## 1. The loop (per font, or per wave of fonts)
1. **Create** — a creator subagent authors/upgrades `src/components/specimen/inuse/<slug>.astro`
   to the rubric. Give it: the font's `.mdx`, `docs/in-use-criteria.md`,
   `docs/inuse-authoring.md`, and one or two PASSED components as quality bars.
2. **Capture** — re-shoot the changed fonts centrally from the one dev server.
3. **Critique** — a *ruthless, adversarial* critic subagent reads the **screenshots**
   (+ the code, to verify interactivity/reduced-motion/tokens/real-px and to catch
   **false feature claims**) and scores each scene per the 6 rubric dimensions,
   withholding 90 until earned. Output is terse: GATES line, per-scene `XX/100
   PASS/FAIL` + one-line top fix, OVERALL min.
4. **Iterate** — feed each failing scene's specific fix back to a creator; re-shoot;
   re-critique. Repeat until every scene ≥90 and all gates pass. Convergence is
   typically 2 rounds; ~3 if a scene needs a concept redirect.

Run fonts in **waves** (≈7 at a time) to keep the loop observable and your own
context manageable. Spawn creators/critics in parallel within a wave.

## 2. Adding a new font (full specimen)
1. **Install** the Fontsource package: `npm i @fontsource-variable/<name>` (or
   `@fontsource/<name>` for static).
2. **Verify the REAL capabilities** before writing any frontmatter (this prevents
   false claims — the rubric fails them):
   ```bash
   node -e "console.log(require('@fontsource-variable/<name>/metadata.json'))"   # weights/styles
   # exact axes + OpenType features from the woff2:
   python3 -c "from fontTools.ttLib import TTFont; ft=TTFont('node_modules/@fontsource-variable/<name>/files/<name>-latin-<file>.woff2'); \
     [print(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in ft['fvar'].axes] if 'fvar' in ft else None; \
     print(sorted({fr.FeatureTag for fr in ft['GSUB'].table.FeatureList.FeatureRecord}))"
   ```
   Use the BASE `latin` subset (not `latin-ext`) for the full feature list.
3. **Load it**: add one import line in `src/layouts/Layout.astro` (pick the `.css`
   that exposes the axes you need — e.g. `standard.css` for wght+wdth, `wght.css`
   single-axis, plus `-italic` if the face has italics).
4. **Describe it**: create `src/content/fonts/<slug>.mdx`. Copy a structural
   reference (`fraunces.mdx` variable / `libre-baskerville.mdx` static), fill the
   frontmatter with the VERIFIED axes/weights/features only, write the editorial
   story. `fontFamily` = the CSS family (e.g. `'Archivo Variable'`). Set `order`
   and `era` (see §3, §4).
5. **Build the In-Use** component via the loop in §1.
6. `npm run build` validates the new `.mdx` against the schema — run it before committing.

## 3. Ordering (the gallery)
The site is history-led, so the index is ordered by **era chronology → year within
era** (set each font's `order`). Era order: inscriptional, old-style, transitional,
didone, slab, grotesque, geometric, digital. This turns the index into a walk
through type history. Re-number with a small loop over the `order:` frontmatter line.

## 4. Wiring a font into History
The era chapter (`src/pages/history/[slug].astro`) resolves its "Faces of the era"
from the **curated `fonts[]` array** in `src/content/eras/<era>.mdx` (NOT by querying
`font.era`). So to show a new font in its chapter you MUST add its slug to that era's
`fonts[]`. Also set the font's own `era:` frontmatter for the specimen→era backlink.
Faces with no specimen page go in the era's `timelineFaces[]` instead.

## 5. Gotchas (learned the hard way)
- **One dev server.** Subagents must NOT start/stop/restart/pkill it — concurrent
  servers fight over the port and crash HMR. The capture script uses its own headless
  browser against the running server, so it never needs to touch the server.
- **Astro scoped styles + runtime DOM.** Astro scopes component CSS with a build-time
  `data-astro-cid-*` attribute. Elements built at runtime with `createElement` DON'T
  get it, so scoped class styles won't apply (→ unstyled content after interaction).
  Reorder/`textContent`/class-toggle on server-rendered nodes is safe; for new nodes,
  clone an in-source `<template>` (which carries the attribute) instead.
- **No `innerHTML`.** A security hook blocks it; use `replaceChildren()`/`textContent`/
  `createElement`.
- **No false claims.** Never set `font-feature-settings`/`font-variation-settings` for
  a feature or axis the font lacks (critics verify against the woff2). Verify with §2.
- **Force scroll-reveals when capturing.** `[data-reveal]` elements are `opacity:0`
  until scrolled in; the capture script force-reveals them so screenshots aren't blank.
- **zsh, not bash.** The shell doesn't word-split unquoted vars (`for x in ${=var}`)
  and lacks `declare -A`.

## 6. Finish
`npm run build` (must be clean) → commit → push to `main` (this repo commits directly
to main; no feature branches).
