// Shared loader + pointer loop for the hand-built "new edition" specimen pages.
import { getCollection } from 'astro:content';
import { themeToStyle } from './theme';

/** Collection entry, neighbours and theme for one hand-built page. */
export async function getEdition(slug: string) {
  const fonts = (await getCollection('fonts')).sort((a, b) => a.data.order - b.data.order);
  const i = fonts.findIndex((f) => f.id === slug);
  if (i < 0) throw new Error(`No font entry for "${slug}"`);
  const entry = fonts[i];
  return {
    entry,
    font: entry.data,
    prev: fonts[(i - 1 + fonts.length) % fonts.length],
    next: fonts[(i + 1) % fonts.length],
    themeStyle: themeToStyle(entry.data.theme),
  };
}
