// Build-time "ink remaining" measurement for a variable font.
// Decodes the served woff2, walks one axis, and integrates the real glyph
// outlines (Green's theorem over flattened quadratics) so a page can report
// how much of a letterform is actually left at each axis position.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function area(font: any, str: string): number {
  let total = 0;
  for (const g of font.layout(str).glyphs) {
    let A = 0, sx = 0, sy = 0, cx = 0, cy = 0;
    const seg = (x: number, y: number) => { A += (cx * y - x * cy) / 2; cx = x; cy = y; };
    for (const cmd of g.path.commands) {
      const a = cmd.args;
      if (cmd.command === 'moveTo') { cx = sx = a[0]; cy = sy = a[1]; }
      else if (cmd.command === 'lineTo') seg(a[0], a[1]);
      else if (cmd.command === 'quadraticCurveTo') {
        const x0 = cx, y0 = cy;
        for (let i = 1; i <= 8; i++) {
          const t = i / 8, u = 1 - t;
          seg(u * u * x0 + 2 * u * t * a[0] + t * t * a[2], u * u * y0 + 2 * u * t * a[1] + t * t * a[3]);
        }
      } else if (cmd.command === 'closePath') seg(sx, sy);
    }
    total += Math.abs(A);
  }
  return total;
}

/** Ink area at every integer axis stop, as a fraction of the area at `min`. */
export async function inkByAxis(opts: {
  pkg: string; file: string; axis: string; min: number; max: number; sample: string;
}): Promise<number[]> {
  const fontkit: any = await import('fontkit');
  const woff2: any = await import('wawoff2');
  const raw = readFileSync(join(process.cwd(), 'node_modules', opts.pkg, 'files', opts.file));
  const font = fontkit.create(Buffer.from(await woff2.decompress(raw)));
  const base = area(font.getVariation({ [opts.axis]: opts.min }), opts.sample);
  const out: number[] = [];
  for (let v = opts.min; v <= opts.max; v++) {
    out.push(area(font.getVariation({ [opts.axis]: v }), opts.sample) / base);
  }
  return out;
}

/** Flatten a fontkit glyph path into closed polylines. */
function polylines(path: any): number[][][] {
  const out: number[][][] = [];
  let cur: number[][] = [], cx = 0, cy = 0;
  for (const cmd of path.commands) {
    const a = cmd.args;
    if (cmd.command === 'moveTo') { cur = [[a[0], a[1]]]; out.push(cur); cx = a[0]; cy = a[1]; }
    else if (cmd.command === 'lineTo') { cur.push([a[0], a[1]]); cx = a[0]; cy = a[1]; }
    else if (cmd.command === 'quadraticCurveTo') {
      for (let i = 1; i <= 8; i++) { const t = i / 8, u = 1 - t; cur.push([u * u * cx + 2 * u * t * a[0] + t * t * a[2], u * u * cy + 2 * u * t * a[1] + t * t * a[3]]); }
      cx = a[2]; cy = a[3];
    } else if (cmd.command === 'closePath' && cur.length) cur.push(cur[0]);
  }
  return out;
}

/** Sorted crossings of the outline with a horizontal (axis 1) or vertical (axis 0) line. */
function crossings(polys: number[][][], axis: 0 | 1, at: number): number[] {
  const hits: number[] = [];
  const o = axis === 1 ? 0 : 1;
  for (const p of polys) for (let i = 0; i + 1 < p.length; i++) {
    const a = p[i], b = p[i + 1];
    if ((a[axis] <= at) !== (b[axis] <= at)) hits.push(a[o] + ((at - a[axis]) / (b[axis] - a[axis])) * (b[o] - a[o]));
  }
  return hits.sort((x, y) => x - y);
}

/**
 * Thick and thin stroke of a capital H, in thousandths of an em, at each integer stop of
 * an axis: the stem (measured across, a quarter of the way up) and the
 * crossbar (measured down the centre line).
 */
export async function strokeContrast(opts: {
  pkg: string; file: string; axis: string; min: number; max: number; fixed?: Record<string, number>;
}): Promise<{ thick: number; thin: number }[]> {
  const fontkit: any = await import('fontkit');
  const woff2: any = await import('wawoff2');
  const raw = readFileSync(join(process.cwd(), 'node_modules', opts.pkg, 'files', opts.file));
  const font = fontkit.create(Buffer.from(await woff2.decompress(raw)));
  const out: { thick: number; thin: number }[] = [];
  for (let v = opts.min; v <= opts.max; v++) {
    const f = font.getVariation({ ...(opts.fixed ?? {}), [opts.axis]: v });
    const g = f.layout('H').glyphs[0];
    const polys = polylines(g.path);
    const cap = f.capHeight || 700;
    const xs = crossings(polys, 1, cap * 0.25);
    const ys = crossings(polys, 0, g.advanceWidth / 2);
    const k = 1000 / font.unitsPerEm; // report in thousandths of an em
    out.push({ thick: xs.length >= 2 ? (xs[1] - xs[0]) * k : 0, thin: ys.length >= 2 ? (ys[1] - ys[0]) * k : 0 });
  }
  return out;
}
