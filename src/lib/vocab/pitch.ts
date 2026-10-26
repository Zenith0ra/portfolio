/**
 * Japanese pitch accent helpers.
 *
 * Notation used throughout: the number n means "the pitch drops after mora n".
 *   0        heiban    – first mora low, everything after (and particles) high
 *   1        atamadaka – first mora high, everything after low
 *   n (2..)  nakadaka  – rises on mora 2, drops after mora n
 *   n = len  odaka     – rises on mora 2, stays high through the last mora,
 *                        the following particle is low
 */

const SMALL_KANA = new Set(
  "ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ".split("")
);

/** Split kana into morae. Small kana attach to the previous mora. */
export function splitMora(kana: string): string[] {
  const out: string[] = [];
  for (const ch of kana) {
    if (/[\s\u30fb]/.test(ch)) continue;
    if (SMALL_KANA.has(ch) && out.length > 0) {
      out[out.length - 1] += ch;
    } else {
      out.push(ch);
    }
  }
  return out;
}

/**
 * Per-mora heights. 1 = high, 0 = low.
 * Returns [] when the accent is unknown.
 */
export function pitchHeights(moraCount: number, pitch: number | null): number[] {
  if (pitch === null || moraCount <= 0) return [];
  if (pitch === 0) {
    return Array.from({ length: moraCount }, (_, i) => (i === 0 ? 0 : 1));
  }
  if (pitch === 1) {
    return Array.from({ length: moraCount }, (_, i) => (i === 0 ? 1 : 0));
  }
  return Array.from({ length: moraCount }, (_, i) =>
    i === 0 ? 0 : i < pitch ? 1 : 0
  );
}
