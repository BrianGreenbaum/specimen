// AAA r4 — the value-relationship metrics, stated so a critic can check the method.
//
// A) GRID REGIONS (primary). Normalise to 640x360 (the r3 critic's normalisation), cut into a
//    16x9 grid of 40x40 cells, rank by mean Rec.709 luminance, take the TOP 10, and classify each
//    as a CARD region if >=55% of its area is covered by card rects (`.perm .bfc` + `.hand-card`).
//    This cannot be gamed by adding objects to an enumeration — the frame is partitioned.
// B) OBJECT REGIONS (secondary, the literal reading of "ten brightest regions"): DOM rects, >=400px^2
//    in the normalised grid, ranked. Reported because it is what the prescription literally says;
//    it starts at 6/10 on the r3 build, so it is the weaker of the two.
// C) THE SUBSTANCE: mean/min/max luminance of the CARD TILES, and the mean of the FELT — the bare
//    play surface, i.e. slab pixels not covered by any card, orb, control, pill or chrome rect.
//    The prescription is "felt 55-60, tiles 85-100"; these are the two numbers that says.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const probe = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const png = process.argv[3];
const key = process.argv[4];
const rec = probe.out[key];
if (!rec) { console.error('no probe record for ' + key); process.exit(1); }

const W = 640, H = 360;
const { data } = await sharp(png).resize(W, H, { fit: 'fill' }).removeAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++)
  lum[i] = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2];

const sx = W / rec.vw, sy = H / rec.vh;
const norm = (o) => ({
  x0: Math.max(0, Math.round(o.x * sx)), y0: Math.max(0, Math.round(o.y * sy)),
  x1: Math.min(W, Math.round((o.x + o.w) * sx)), y1: Math.min(H, Math.round((o.y + o.h) * sy)),
  kind: o.kind, label: o.label,
});
const objs = rec.objs.map(norm);

// masks
const cardMask = new Uint8Array(W * H);
const anyMask = new Uint8Array(W * H);
for (const o of objs) {
  const m = o.kind === 'card' ? cardMask : null;
  for (let y = o.y0; y < o.y1; y++) for (let x = o.x0; x < o.x1; x++) {
    anyMask[y * W + x] = 1; if (m) m[y * W + x] = 1;
  }
}

// ---- A) grid regions -----------------------------------------------------------------------
const CELL = 40, GX = W / CELL, GY = H / CELL;
const cells = [];
for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
  let s = 0, n = 0, c = 0;
  for (let y = gy * CELL; y < gy * CELL + CELL; y++) for (let x = gx * CELL; x < gx * CELL + CELL; x++) {
    s += lum[y * W + x]; n++; if (cardMask[y * W + x]) c++;
  }
  cells.push({ gx, gy, L: +(s / n).toFixed(1), cardFrac: c / n });
}
cells.sort((a, b) => b.L - a.L);
const topCells = cells.slice(0, 10);
const gridCards = topCells.filter((c) => c.cardFrac >= 0.55).length;

// ---- B) object regions ---------------------------------------------------------------------
const rows = [];
for (const o of objs) {
  const area = (o.x1 - o.x0) * (o.y1 - o.y0);
  if (area < 400) continue;
  let s = 0, n = 0;
  for (let y = o.y0; y < o.y1; y++) for (let x = o.x0; x < o.x1; x++) { s += lum[y * W + x]; n++; }
  rows.push({ kind: o.kind, label: o.label, area, L: +(s / n).toFixed(1) });
}
rows.sort((a, b) => b.L - a.L);
const topObjs = rows.slice(0, 10);
const objCards = topObjs.filter((r) => r.kind === 'card').length;

// ---- C) the substance ------------------------------------------------------------------------
const cardRows = rows.filter((r) => r.kind === 'card');
const stat = (a) => a.length ? { mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1),
  min: +Math.min(...a).toFixed(1), max: +Math.max(...a).toFixed(1), n: a.length } : null;
const tiles = stat(cardRows.map((r) => r.L));
// felt = interior band of the frame (drop the outer 8% ring, which is the room), minus every object
let fs = 0, fn = 0;
for (let y = Math.round(H * 0.10); y < Math.round(H * 0.92); y++)
  for (let x = Math.round(W * 0.03); x < Math.round(W * 0.80); x++)
    if (!anyMask[y * W + x]) { fs += lum[y * W + x]; fn++; }
const felt = fn ? +(fs / fn).toFixed(1) : null;

console.log(`${key}`);
console.log(`  A) grid: card regions in top-10 = ${gridCards}/10   [${topCells.map(c => `${c.L}${c.cardFrac>=0.55?'C':''}`).join(' ')}]`);
console.log(`  B) objs: card tiles  in top-10 = ${objCards}/10`);
for (const r of topObjs) console.log(`       ${String(r.L).padStart(6)}  ${r.kind.padEnd(10)} ${r.label}`);
console.log(`  C) CARD TILES  mean ${tiles?.mean}  (min ${tiles?.min}, max ${tiles?.max}, n=${tiles?.n})   target 85-100`);
console.log(`     FELT (bare play surface) mean ${felt}   target 55-60`);
console.log(`     tile-minus-felt = ${tiles ? (tiles.mean - felt).toFixed(1) : '?'}`);
