/** One segment of a sentence: plain text, or a kanji run plus its reading. */
export interface RubyPiece {
  base: string;
  reading: string | null;
}

/** A run of kanji followed by its reading in brackets: 今日[きょう] */
const ANNOTATED = /([\u3400-\u4dbf\u4e00-\u9fff々〆]+)\[([^[\]]+)\]/g;

export function parseAnnotated(text: string): RubyPiece[] {
  const out: RubyPiece[] = [];
  let last = 0;
  ANNOTATED.lastIndex = 0;
  for (let m = ANNOTATED.exec(text); m; m = ANNOTATED.exec(text)) {
    if (m.index > last) out.push({ base: text.slice(last, m.index), reading: null });
    out.push({ base: m[1], reading: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ base: text.slice(last), reading: null });
  return out;
}

export function hasAnnotation(text: string): boolean {
  ANNOTATED.lastIndex = 0;
  return ANNOTATED.test(text);
}

/**
 * Split an annotated sentence into its plain form and its annotated form.
 * Handles the model putting the brackets in `jp` instead of `ruby`.
 */
export function splitAnnotated(text: string): { jp: string; ruby: string | null } {
  const pieces = parseAnnotated(text);
  const jp = pieces.map((p) => p.base).join("");
  if (!pieces.some((p) => p.reading)) return { jp, ruby: null };
  const ruby = pieces
    .map((p) => (p.reading ? `${p.base}[${p.reading}]` : p.base))
    .join("");
  return { jp, ruby };
}
