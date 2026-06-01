// Reusable glyph-set strings for the character grid.

export const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const lowercase = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const figures = '0123456789'.split('');
export const punctuation =
  '. , : ; … ! ¡ ? ¿ · • * # / \\ ( ) [ ] { } ⟨ ⟩ « » “ ” ‘ ’ \' " - – — _ '.trim().split(/\s+/);
export const symbols =
  '& @ § ¶ © ® ™ ° | ¦ † ‡ ^ ~ + − × ÷ = ≠ < > ≤ ≥ ± ∞ µ π ∆ ∑ √ ∂ ∫ % ‰'.split(/\s+/);
export const currency = '$ ¢ £ ¥ € ₿ ₽ ₹ ₩ ₺ ฿ ₫ ₪ ¤'.split(/\s+/);
export const accented =
  'À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ø Œ Ù Ú Û Ü Ý Þ ß à á â ã ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö ø œ ù ú û ü ý þ ÿ'.split(
    /\s+/
  );

export interface GlyphCategory {
  name: string;
  glyphs: string[];
}

export const glyphCategories: GlyphCategory[] = [
  { name: 'Uppercase', glyphs: uppercase },
  { name: 'Lowercase', glyphs: lowercase },
  { name: 'Figures', glyphs: figures },
  { name: 'Punctuation', glyphs: punctuation },
  { name: 'Symbols', glyphs: symbols },
  { name: 'Currency', glyphs: currency },
  { name: 'Accented', glyphs: accented },
];
