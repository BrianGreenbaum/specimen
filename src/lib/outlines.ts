// Build-time glyph-outline extraction.
// Parses the same fontsource binaries the site serves (woff2 → TTF via
// wawoff2, then fontkit) and emits the real Bézier contours, control points
// and vertical metrics in font units. For variable faces we sample the wght
// axis at several stops with identical point structure, so the client can
// morph the drawing live by interpolating coordinates.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface OutlineInstance {
  w: number; // wght this instance was sampled at
  adv: number; // advance width (font units)
  coords: number[]; // flat coordinates matching the command template
}

export interface OutlineGlyph {
  char: string;
  name: string; // glyph name inside the font, e.g. 'ampersand'
  cp: number; // unicode code point
  cmds: string; // command template: M / L / Q / C / Z per segment
  contours: number;
  on: number; // on-curve point count
  off: number; // off-curve (control) point count
  instances: OutlineInstance[];
}

export interface FontOutlines {
  upm: number;
  ascent: number; // font units above baseline
  descent: number; // font units below baseline (negative)
  capHeight: number;
  xHeight: number;
  stops: number[]; // sampled wght values (single entry for static faces)
  defaultStop: number; // wght value the slider starts at
  glyphs: OutlineGlyph[];
}

// Coordinate count per path command.
const ARITY: Record<string, number> = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };

// Characters every specimen offers (filtered to what the font actually has);
// per-font signature glyphs from the anatomy callouts are prepended.
const DEFAULT_CHARS = ['a', 'g', 'R', 'e', 'Q', '&', 'S', 'k', '2', 'y', 'j'];
const MAX_GLYPHS = 10;
const WGHT_STOPS = 5;

const fontCache = new Map<string, any>();

/** Find the best axis-subset file inside the fontsource package. */
function findFontFile(pkg: string, slug: string): string | null {
  const dir = join(process.cwd(), 'node_modules', pkg, 'files');
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return null;
  }
  const priority = [
    `${slug}-latin-wght-normal.woff2`,
    `${slug}-latin-standard-normal.woff2`,
    `${slug}-latin-full-normal.woff2`,
    `${slug}-latin-opsz-normal.woff2`,
    `${slug}-latin-400-normal.woff2`,
    `${slug}-latin-400-normal.woff`,
  ];
  for (const name of priority) if (files.includes(name)) return join(dir, name);
  const any = files.find((f) => f.includes('latin') && f.includes('normal'));
  return any ? join(dir, any) : null;
}

async function openFont(pkg: string, slug: string): Promise<any | null> {
  const key = `${pkg}`;
  if (fontCache.has(key)) return fontCache.get(key);
  const file = findFontFile(pkg, slug);
  if (!file) return null;
  try {
    const fontkit = await import('fontkit');
    let buf: Buffer = readFileSync(file);
    if (file.endsWith('.woff2')) {
      // fontkit's variation support is unreliable on WOFF2-transformed glyf
      // tables — decompress to plain TTF first.
      const woff2 = await import('wawoff2');
      buf = Buffer.from(await woff2.decompress(buf));
    }
    const font = (fontkit as any).create(buf);
    fontCache.set(key, font);
    return font;
  } catch {
    return null;
  }
}

/** Serialize a fontkit path into a command template + flat coordinate list. */
function serializePath(path: any): { cmds: string; coords: number[] } | null {
  let cmds = '';
  const coords: number[] = [];
  for (const c of path.commands) {
    switch (c.command) {
      case 'moveTo':
        cmds += 'M';
        coords.push(c.args[0], c.args[1]);
        break;
      case 'lineTo':
        cmds += 'L';
        coords.push(c.args[0], c.args[1]);
        break;
      case 'quadraticCurveTo':
        cmds += 'Q';
        coords.push(...c.args.slice(0, 4));
        break;
      case 'bezierCurveTo':
        cmds += 'C';
        coords.push(...c.args.slice(0, 6));
        break;
      case 'closePath':
        cmds += 'Z';
        break;
      default:
        return null; // unknown command — bail on this glyph
    }
  }
  return { cmds, coords: coords.map((n) => Math.round(n * 10) / 10) };
}

function linspace(min: number, max: number, n: number): number[] {
  if (n <= 1) return [min];
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.round(min + ((max - min) * i) / (n - 1)));
  return [...new Set(out)];
}

export interface OutlineSource {
  id: string; // content entry id == fontsource package suffix
  isVariable: boolean;
  axes: { tag: string; min: number; max: number; default: number }[];
  callouts: { glyph: string }[];
}

export async function getOutlines(src: OutlineSource): Promise<FontOutlines | null> {
  const pkg = (src.isVariable ? '@fontsource-variable/' : '@fontsource/') + src.id;
  const font = await openFont(pkg, src.id);
  if (!font) return null;

  // The wght range as the served file actually has it (frontmatter ranges can
  // describe a different axis-subset file).
  const fileWght = font.variationAxes?.wght as { min: number; max: number } | undefined;
  const metaWght = src.axes.find((a) => a.tag === 'wght');
  const stops = fileWght ? linspace(fileWght.min, fileWght.max, WGHT_STOPS) : [metaWght?.default ?? 400];
  // The client interpolates freely between stops, so the slider can start at
  // the face's true default weight rather than the nearest sampled stop.
  const defaultStop = fileWght
    ? Math.round(Math.min(fileWght.max, Math.max(fileWght.min, metaWght?.default ?? 400)))
    : stops[0];

  const instCache = new Map<number, any>();
  const instanceAt = (w: number) => {
    if (!fileWght) return font;
    if (!instCache.has(w)) instCache.set(w, font.getVariation({ wght: w }));
    return instCache.get(w);
  };

  const wanted = [
    ...src.callouts.map((c) => c.glyph).filter((g) => [...g].length === 1),
    ...DEFAULT_CHARS,
  ];
  const seen = new Set<string>();
  const glyphs: OutlineGlyph[] = [];

  for (const char of wanted) {
    if (glyphs.length >= MAX_GLYPHS) break;
    if (seen.has(char)) continue;
    seen.add(char);
    const cp = char.codePointAt(0)!;
    if (!font.hasGlyphForCodePoint?.(cp)) continue;
    const base = font.glyphForCodePoint(cp);
    if (!base || base.id === 0) continue;

    try {
      const instances: OutlineInstance[] = [];
      let template: string | null = null;
      let counts: { contours: number; on: number; off: number } | null = null;

      for (const w of stops) {
        const g = instanceAt(w).getGlyph(base.id);
        if (!g) continue;
        const ser = serializePath(g.path);
        if (!ser || ser.cmds.length === 0) continue;
        if (template === null) {
          template = ser.cmds;
          let on = 0;
          let off = 0;
          for (const c of ser.cmds) {
            if (c === 'M' || c === 'L') on += 1;
            else if (c === 'Q') (on += 1), (off += 1);
            else if (c === 'C') (on += 1), (off += 2);
          }
          counts = { contours: (ser.cmds.match(/M/g) ?? []).length, on, off };
        }
        // Point structure must match across instances for morphing.
        if (ser.cmds !== template) continue;
        instances.push({ w, adv: Math.round(g.advanceWidth), coords: ser.coords });
      }

      if (template && counts && instances.length > 0) {
        glyphs.push({
          char,
          name: base.name ?? char,
          cp,
          cmds: template,
          contours: counts.contours,
          on: counts.on,
          off: counts.off,
          instances,
        });
      }
    } catch {
      /* skip glyphs that fail to extract */
    }
  }

  if (glyphs.length === 0) return null;

  return {
    upm: font.unitsPerEm,
    ascent: Math.round(font.ascent),
    descent: Math.round(font.descent),
    capHeight: Math.round(font.capHeight),
    xHeight: Math.round(font.xHeight),
    stops,
    defaultStop,
    glyphs,
  };
}
