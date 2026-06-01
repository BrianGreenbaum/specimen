import type { CollectionEntry } from 'astro:content';

type Theme = CollectionEntry<'fonts'>['data']['theme'];

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
