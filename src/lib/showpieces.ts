// Hand-built specimens. `showpieces` are faces that live outside the `fonts`
// content collection (and so outside Compare / Pair / Moods / History); the
// header, home index and command palette read the list so they sit alongside
// every other face. `newEditions` are collection faces whose page has been
// rebuilt by hand in the same format (src/pages/fonts/<slug>.astro).

export interface Showpiece {
  slug: string;        // route: /fonts/<slug>
  name: string;
  family: string;      // CSS family (imported in Layout.astro)
  designer: string;
  year: number;
  tag: string;         // short descriptive label
  category: 'Sans' | 'Serif' | 'Display' | 'Monospace' | 'Slab';
  accent: string;      // row hover colour in the index
  blurb: string;
  /** inline style for the name when it is set small, in its own face (nav menus) */
  nameStyle: string;
}

export const showpieces: Showpiece[] = [
  {
    slug: 'recursive',
    category: 'Sans',
    accent: '#e8391a',
    name: 'Recursive',
    family: 'Recursive Variable',
    designer: 'Stephen Nixon, Arrow Type',
    year: 2020,
    tag: 'Variable · 5 axes',
    blurb: 'One file, five dials: from code editor to sign-painter’s brush.',
    nameStyle: "font-family:'Recursive Variable';font-size:1.3rem;font-variation-settings:'CASL' 1,'wght' 850,'slnt' -12,'CRSV' 1",
  },
  {
    slug: 'climate-crisis',
    category: 'Display',
    accent: '#1f7fa6',
    name: 'Climate Crisis',
    family: 'Climate Crisis Variable',
    designer: 'Daniel Coull & Eino Korkala',
    year: 2020,
    tag: 'Variable · Data',
    blurb: 'One axis, measured in years. The letters melt as the Arctic does.',
    nameStyle: "font-family:'Climate Crisis Variable';font-size:1.05rem;font-variation-settings:'YEAR' 2005",
  },
  {
    slug: 'nabla',
    category: 'Display',
    accent: '#e08a00',
    name: 'Nabla',
    family: 'Nabla Variable',
    designer: 'Arthur Reinders Folmer',
    year: 2022,
    tag: 'Colour · 3D',
    blurb: 'A colour font with a third dimension — and a light switch.',
    nameStyle: "font-family:'Nabla Variable';font-size:2.1rem;font-variation-settings:'EDPT' 120,'EHLT' 16",
  },
  {
    slug: 'handjet',
    category: 'Display',
    accent: '#c98a00',
    name: 'Handjet',
    family: 'Handjet Variable',
    designer: 'David Březina, Rosetta',
    year: 2020,
    tag: 'Variable · Pixel',
    blurb: 'Every letter is a grid of one small shape. You choose the shape.',
    nameStyle: "font-family:'Handjet Variable';font-size:2.3rem;line-height:0.8;font-variation-settings:'wght' 600,'ELGR' 1,'ELSH' 8",
  },
];

/** Collection faces whose specimen page has been rebuilt by hand. */
export const newEditions = ['fraunces', 'archivo'];

/** Label shown beside any face presented in the new format. */
export const NEW_EDITION_LABEL = 'New edition';
