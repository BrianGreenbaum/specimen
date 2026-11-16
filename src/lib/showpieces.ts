// Showpiece specimens: bespoke, hand-built pages that live outside the
// `fonts` content collection (and so outside Compare / Pair / Moods / History).
// The header, home index and command palette read this list so the pages stay
// reachable from the main navigation.

export interface Showpiece {
  slug: string;        // route: /fonts/<slug>
  name: string;
  family: string;      // CSS family (imported in Layout.astro)
  designer: string;
  year: number;
  tag: string;         // short category label
  blurb: string;
  /** inline style for the name when it is set small, in its own face (nav menus) */
  nameStyle: string;
}

export const showpieces: Showpiece[] = [
  {
    slug: 'nabla',
    name: 'Nabla',
    family: 'Nabla Variable',
    designer: 'Arthur Reinders Folmer',
    year: 2022,
    tag: 'Colour · 3D',
    blurb: 'A colour font with a third dimension — and a light switch.',
    nameStyle: "font-family:'Nabla Variable';font-size:2.1rem;font-variation-settings:'EDPT' 120,'EHLT' 16",
  },
  {
    slug: 'climate-crisis',
    name: 'Climate Crisis',
    family: 'Climate Crisis Variable',
    designer: 'Daniel Coull & Eino Korkala',
    year: 2020,
    tag: 'Variable · Data',
    blurb: 'One axis, measured in years. The letters melt as the Arctic does.',
    nameStyle: "font-family:'Climate Crisis Variable';font-size:1.05rem;font-variation-settings:'YEAR' 2005",
  },
];
