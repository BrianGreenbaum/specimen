# "In Use" — Specimen Example Criteria (v2 — the Canvas rubric)

The bar for every In-Use example on a specimen page. Each font gets **4–5 acts** —
applied, art-directed artifacts that could hang in a design annual. **Pass = 92/100
per act**, no act below the line, all gates green. Anything less is iterated until
it clears. There is no round cap; the bar does not move.

## The category framework

Every act belongs to one of five applied categories. Each font covers the **4–5
categories where it is genuinely credible** — no forced misfits (Pinyon Script owes
no dashboard; Inter owes no couture poster). A font may double a category only by
taking a meaningfully different angle on it.

1. **Branding & identity** — wordmark in situ, identity system, packaging, signage,
   title sequence, record sleeve, label.
2. **Illustration & commercial** — poster (concert, film, exhibition, protest),
   advertising campaign, book cover, broadside. Type as the picture.
3. **Editorial** — magazine spread/cover, newspaper page, journal, long-form feature,
   annual report. Real typographic systems: decks, folios, pull quotes, captions.
4. **Web & app UI** — product interface at true device scale (real px), genuinely
   interactive. Dashboard, mobile app, reader, editor, terminal, commerce.
5. **Interactive & experimental** — type as instrument or artwork: kinetic/reactive
   type, variable-axis play, generative composition, concrete poetry, a piece that
   could live in a digital-art gallery.

## Presentation: the open canvas (NEW — replaces the gallery wall)

- **No frames, no mats, no borders, no card shadows.** The old museum mat is gone.
  Each act sits directly on the web canvas and owns its full surface.
- **Acts may bleed.** Use `.iu__item--bleed` to run edge-to-edge when the artifact
  wants it (posters, identities, experimental pieces usually do; a phone UI may not).
- **The handoff is designed.** The transition from one act to the next is part of the
  composition — a surface change, a color field handed off, a scale shift, a beat of
  quiet. The full stack must read as one art-directed sequence, not five unrelated
  embeds. Components may override the default `.iu` gap (including to zero) to
  choreograph this.
- Captions stay quiet plate-labels below each act (`.iu__cap`).

## Hard gates (fail the whole font if any is unmet)

- **4–5 acts**, each assigned to a category, covering ≥4 distinct categories.
- **≥1 true UI act** when the font plausibly serves UI/text — true device scale
  (real px), driven by the user (sort, input, tabs, drag, toggle).
- **Font-specific.** An act portable to another face unchanged is an automatic fail.
- **No frames/mats/borders** around acts; the stack reads as a designed sequence.
- **Responsive & uncropped at 390 / 768 / 1440 px** — *recomposed*, not shrunk.
  Tablet (768) is a first-class layout, not a stretched phone.
- **Light + dark safe** via theme tokens (a scene may be its own intentional surface,
  e.g. a dark terminal or a printed poster — then it must declare its surface fully).
- **Reduced-motion safe** (`prefers-reduced-motion: reduce` stills all non-essential
  motion; the act must remain complete without it).
- **Live webfont text only** — never images of text. No false feature claims: never
  set an axis/feature the font file lacks (verified against the woff2).

## Scored dimensions (100 pts; 92 to pass)

### 1. Font-strength representation — 20
The act dramatizes what makes *this* face singular: variable axes driven or
performed; opsz contrast staged; Didone hairlines at scale; true italics, swashes,
alternates, ligatures exercised; mono structure used structurally; x-height/width
put to work in dense UI. A scene that ignores the face's character caps at 8/20.

### 2. Design-history literacy — 15
The act is grounded in a *named, specific* design tradition or contemporary current,
and gets it **right**: Trajan inscriptional → Renaissance humanism; Victorian
playbill; Vienna Secession; Bauhaus/constructivist; Swiss International Style; Push
Pin & psychedelia; phototype-era 70s advertising; Emigre & 80s digital; Carson-era
grunge; Y2K; the Dutch conceptual school; contemporary editorial (Gourmand, Apartamento,
NYT Mag), contemporary brutalist/anti-design web; data-driven motion identity. Vague
"retro vibes," wrong-era pastiche, or anachronistic details (a 1920s artifact with
2020s UI furniture) score ≤5. Faithful pastiche executed with modern craft, or a
deliberate, knowing collision of eras, scores high.

### 3. Typographic craft — 20
Hierarchy with conviction; scale contrast that commits; correct leading/tracking/measure
at every size; optical alignment (hung punctuation where it matters); weights/italics/case
chosen, not defaulted; OpenType on target (small caps, oldstyle vs lining vs tabular
figures, fractions, ligatures); no rivers, widows, or muddy mid-grays. Display type is
*composed* — kerned, broken, and ragged deliberately.

### 4. Art direction & visual quality — 20
Award-annual composition: balance, tension, whitespace as material, a palette with
discipline, a grid honored or knowingly broken, one focal idea per act. The reference
bar is D&AD / TDC / ADC annuals, Klim & Commercial Type specimens, Pentagram casework —
not a polished bootstrap demo. Decoration without an idea caps at 10/20.

### 5. Believability & category fit — 10
The act is a *credible artifact of its category*: a poster with imprint and date; a
spread with folio and issue; an identity with a system, not just a logo; a UI with
plausible data and states. Real copy that sells the fiction — no lorem, no filler.

### 6. Web-native motion, interaction & the handoff — 15
The piece belongs to the web: variable-axis animation, scroll/pointer-reactive type,
SVG `textPath`/draw-in, `mix-blend-mode`, container-query recomposition, `::selection`,
view transitions — chosen because the medium of the artifact calls for it. UI acts are
genuinely driven by the user. Print-born acts get one fitting, restrained motion idea,
not bolted-on sliders. **The act-to-act handoff is scored here too**: the sequence
should feel paced. Smooth (compositor-friendly), reduced-motion safe. A stunning
static act with one perfect touch can take full marks; an inert flat embed caps at 8.

## Critic output contract
For each act: `index`, `title`, `category`, `score` (0–100), `dimensionScores` (the 6
above), `verdict` (pass ≥92 / fail), `strengths`, `problems`, `topFixes` (concrete,
ordered), or `redirect` with a better concept if the direction is a dead end. Plus a
`gates` map (each hard gate → pass/fail + evidence) and `stack` notes on the full
sequence (handoffs, 390/768/1440 reads). Judge the **screenshots**, verify claims in
the **code** and the **font file**. Withhold the 92 until it is earned; "good" is a fail.
