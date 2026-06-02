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

// NB: these set the SEMANTIC tokens (--bg, --fg, --line…) directly rather than
// the --paper/--ink palette aliases. The aliases are resolved once at :root
// (`--bg: var(--paper)`), so setting --paper on <body> never reaches --bg.
// Setting the semantic tokens straight on <body> makes each font/era theme
// apply in full — and makes the page immune to the global light/dark toggle,
// which is exactly what we want for these fixed-art-direction pages.

/** Build a full palette from just bg / fg / accent (used by era chapters). */
export function eraThemeStyle(t: { bg: string; fg: string; accent: string }): string {
  const { bg, fg, accent } = t;
  const dark = luminance(bg) < 0.5;
  return [
    `--bg:${bg}`,
    `--bg-2:color-mix(in srgb, ${bg} 90%, ${fg} 10%)`,
    `--fg:${fg}`,
    `--fg-2:color-mix(in srgb, ${fg} 72%, ${bg} 28%)`,
    `--fg-3:color-mix(in srgb, ${fg} 48%, ${bg} 52%)`,
    `--accent:${accent}`,
    `--accent-contrast:${bg}`,
    `--line:color-mix(in srgb, ${fg} 14%, transparent)`,
    `--line-soft:color-mix(in srgb, ${fg} 7%, transparent)`,
    `color-scheme:${dark ? 'dark' : 'light'}`,
  ].join(';');
}

/** Build the inline style string that overrides palette tokens per font. */
export function themeToStyle(theme: Theme): string {
  return [
    `--bg:${theme.bg}`,
    `--bg-2:${theme.bg2}`,
    `--fg:${theme.fg}`,
    `--fg-2:${theme.fg2}`,
    `--fg-3:${theme.fg3}`,
    `--accent:${theme.accent}`,
    `--accent-contrast:${theme.accentContrast}`,
    `--line:${theme.line}`,
    `--line-soft:${theme.lineSoft}`,
    `color-scheme:${theme.mode}`,
  ].join(';');
}
