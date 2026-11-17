// "New edition" faces: any face with a hand-built page at
// src/pages/fonts/<slug>.astro. Those pages replace the collection template
// for that slug, so the dynamic route skips them and the index tags them.

const pages = import.meta.glob('../pages/fonts/*.astro');

export const editionSlugs: string[] = Object.keys(pages)
  .map((p) => p.split('/').pop()!.replace('.astro', ''))
  .filter((s) => !s.startsWith('['));

export const isEdition = (slug: string) => editionSlugs.includes(slug);

/** Label shown beside any face presented in the new format. */
export const NEW_EDITION_LABEL = 'New edition';
