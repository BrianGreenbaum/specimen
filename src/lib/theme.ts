import type { CollectionEntry } from 'astro:content';

type Theme = CollectionEntry<'fonts'>['data']['theme'];

/** Relative luminance (0–1) of a #rrggbb colour, for light/dark inference. */
export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Build a full palette from just bg / fg / accent (used by era chapters). */
export function eraThemeStyle(t: { bg: string; fg: string; accent: string }): string {
  const { bg, fg, accent } = t;
  const dark = luminance(bg) < 0.5;
  return [
    `--paper:${bg}`,
    `--paper-2:color-mix(in srgb, ${bg} 90%, ${fg} 10%)`,
    `--ink:${fg}`,
    `--ink-2:color-mix(in srgb, ${fg} 72%, ${bg} 28%)`,
    `--ink-3:color-mix(in srgb, ${fg} 48%, ${bg} 52%)`,
    `--accent:${accent}`,
    `--accent-contrast:${dark ? bg : bg}`,
    `--hairline:color-mix(in srgb, ${fg} 14%, transparent)`,
    `--hairline-2:color-mix(in srgb, ${fg} 7%, transparent)`,
  ].join(';');
}

/** Build the inline style string that overrides palette tokens per font. */
export function themeToStyle(theme: Theme): string {
  return [
    `--paper:${theme.bg}`,
    `--paper-2:${theme.bg2}`,
    `--ink:${theme.fg}`,
    `--ink-2:${theme.fg2}`,
    `--ink-3:${theme.fg3}`,
    `--accent:${theme.accent}`,
    `--accent-contrast:${theme.accentContrast}`,
    `--hairline:${theme.line}`,
    `--hairline-2:${theme.lineSoft}`,
  ].join(';');
}
