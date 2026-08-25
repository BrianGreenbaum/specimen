// Native-language sampler sentences, keyed by the language labels Google
// Fonts uses. One string per language — chosen to exercise that script's
// hardest diacritics while staying pleasant to read.

export interface LangSample {
  name: string; // display label for the row
  text: string;
  note?: string; // one-line editorial note
}

export const SAMPLES: Record<string, LangSample> = {
  latin: {
    name: 'Latin',
    text: 'The quick brown fox jumps over the lazy dog.',
    note: 'The basic alphabet — where every face begins.',
  },
  'latin extended': {
    name: 'Latin Extended',
    text: 'Žaņū sędė ģimė Įžvalgioškėse, vėlyvą rudenį Ėriūkuose.',
    note: 'The Baltic and Central-European marks: ogoneks, macrons, carons.',
  },
  vietnamese: {
    name: 'Vietnamese',
    text: 'Con vịt xòe ra hai cánh vàng, quack quack — buổi sáng phố cổ',
    note: 'Stacked tone marks are the deepest test of a Latin face.',
  },
  'latin-ext': {
    name: 'Latin Extended',
    text: 'Žaņū sędė ģimė Įžvalgioškėse, vėlyvą rudenį Ėriūkuose.',
    note: 'The Baltic and Central-European marks: ogoneks, macrons, carons.',
  },
};
