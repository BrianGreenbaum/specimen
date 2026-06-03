// A small corpus of evocative words/phrases used to generate
// randomized specimen showings (Klim-style "shuffle").

export const showWords = [
  'Typeface', 'Letterform', 'Counter', 'Ligature', 'Ascender', 'Baseline',
  'Serif', 'Grotesque', 'Italic', 'Kerning', 'Hinting', 'Aperture',
  'Quotation', 'Manuscript', 'Compendium', 'Vernacular', 'Lithograph',
  'Printer', 'Punchcutter', 'Foundry', 'Specimen', 'Glyph', 'Ampersand',
  'Numeral', 'Diacritic', 'Stencil', 'Florid', 'Marginalia', 'Colophon',
  'Overburningly', 'Nondefaulting', 'Tracklessness', 'Hamburgevons',
];

export const showPhrases = [
  'Setting the standard',
  'Words at every size',
  'Reading & display',
  'From metal to screen',
  'Drawn with intent',
  'The shape of language',
  'A voice in print',
  'Form follows feeling',
  'Ink, paper & pixels',
  'Black on the page',
];

export const paragraphs = [
  'Typography is the craft of endowing human language with a durable visual form. A well-made typeface is at once invisible and unforgettable: it disappears into the act of reading, yet it shapes the tone of every word it carries.',
  'Each letter is a small machine of curves and corners, balanced against the white of the page. The counter, the spur, the terminal — these are the places where a face declares its character, where engineering and emotion meet.',
  'To choose a typeface is to choose a voice. One whispers, another proclaims; one is built for the long quiet of a novel, another for the bright urgency of a headline. The right one feels inevitable.',
  'For five centuries the punchcutter worked in steel and the printer in lead, and the shapes they settled on still govern the screens we read today. The medium changed completely; the letters barely did. That stubbornness is a kind of wisdom.',
  'Read a page set well and you notice nothing at all — the spacing even, the rhythm steady, the grey of the text calm and unbroken. Read a page set badly and every line trips you. Good typography is the art of the unremarkable, perfected.',
  'A revival is never a copy. The designer studies the old proofs, forgives the ink spread and the worn metal, and asks what the punchcutter was reaching for. What returns is not the old face but its intention, redrawn for paper that no longer exists.',
];

// Deterministic shuffle on the client; seeded variety on the server
// is achieved by index-based picking in components.
export function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}
