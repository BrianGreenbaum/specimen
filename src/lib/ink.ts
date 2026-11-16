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
