# "In Use" — Specimen Example Criteria

The bar for every In-Use example on a specimen page. These are not filler thumbnails;
each is an **impressive typographic illustration** that uses the strengths of the
specific typeface and the full capability of the modern web. **Pass = 90/100.**
Anything below 90 is iterated until it clears the bar.

## Hard gates (fail the whole font if unmet)
- **≥ 4 examples per font.**
- **At least one example representative of a real UI screen** (when the font plausibly
  serves UI/text) rendered **at true device scale** (real px sizes, not blown up) and
  **interactive** (tabs, sort, hover, input, toggle — something the user can drive).
- **Font-specific, not template-shared.** An example that could be dropped onto any other
  font unchanged is an automatic fail on Criterion 1.
- **Responsive** and uncropped at 390 / 768 / 1440 px.
- **Light + dark safe** (uses theme tokens; no hard-coded colors that break a mode unless
  the scene is intentionally its own surface, e.g. a dark terminal).
- **Reduced-motion safe** (`prefers-reduced-motion` disables non-essential motion).
- Live webfont text only — never images of text.

## Scored dimensions (100 pts; 90 to pass)

### 1. Font-strength representation — 25
Does the example dramatize what makes *this* typeface special? Identify the face's
signature strengths and build the scene around them:
- variable axes → animate / let the user drive the axis
- optical sizes (opsz) → show the same word at display vs text size, contrast intentional
- high stroke contrast / Didone → large display, hairline serifs, fashion/editorial
- true italics, swashes, ligatures, alternates → exercise the OpenType features
- monospace → column alignment, code, tabular data, ASCII structure
- large x-height / low contrast → dense UI, captions, wayfinding
- humanist warmth → long-form reading, immersive body text
A generic scene that ignores the face's character caps out around 10/25.

### 2. Typographic craft — 20
Deliberate hierarchy and scale contrast; correct leading, tracking, and measure;
optical alignment; tasteful use of weights/italics/case; OpenType features on where they
belong (ligatures, oldstyle/lining + tabular figures, small caps, fractions). No
defaults-look, no muddy hierarchy, no rivers or widows in body settings.

### 3. Realism & context fit — 15
A believable artifact: a real product UI, a real poster/identity, a real spread, a real
invitation. Real content, plausible data, real-world sizing. UI at device scale; print at
print proportions. No lorem that reads as filler when real copy would sell it.

### 4. Visual design quality — 20
Award-tier composition: balance, whitespace, color discipline, grid, focal hierarchy,
intentional crops and details. Should look like it came from Klim / Commercial Type /
Fraunces-Undercase reference work — not a bootstrap demo.

### 5. Web-technology leverage — 10
Meaningful use of the platform: `font-variation-settings` animation, container queries for
true responsive scenes, SVG `textPath`, `mix-blend-mode`, scroll/pointer-reactive type,
view transitions, `::selection`, OpenType via `font-feature-settings`. Gratuitous motion
that doesn't serve the type does not count.

### 6. Interactivity & motion — 10
Every scene must feel web-native, not a flat JPEG — but satisfy this in the way that fits
the medium. UI screens: real user-driven interaction (tabs, sort, input, drag an axis).
Print/editorial/graphic: *medium-appropriate* web craft instead — a variable-axis breathe,
scroll/hover reveals, kinetic type, an SVG draw-in, a tasteful state change on hover. Do NOT
bolt utilitarian sliders onto a couture poster; the motion must belong to the artifact and
add meaning. Smooth, performant, reduced-motion safe. A genuinely stunning static
composition with one tasteful, fitting motion/interaction touch can score full marks here;
a beautiful but completely inert flat scene cannot exceed ~6.

## Critic output contract
For each example, return: `score` (0–100), `dimensionScores` (the 6 above), `verdict`
(pass ≥90 / fail), `strengths`, `problems`, and `recommendation` — either concrete fixes to
push it over 90, or "redirect" with a better concept if the current direction is a
dead end. Be adversarial: withhold the 90 until the example genuinely earns it.
