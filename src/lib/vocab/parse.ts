import {
  asPos,
  hasKanji,
  isKanaOnly,
  BLANK_CELL,
  type WordDraft,
} from "./types";

/**
 * A deliberately dumb, dependency-free parser.
 *
 * Real word lists come out of PDFs, screenshots, Excel and chat messages, so
 * column separators vary wildly. The strategy is: try the most explicit
 * separator first, and only accept an ambiguous one when the result still looks
 * like a word row (first cell pure kana, at most five cells).
 */

export interface ParseOutcome {
  words: WordDraft[];
  /** lines that looked like data but could not be understood */
  skipped: number;
  quality: "ok" | "poor" | "empty";
}

const ORDINAL = /^\s*(?:[（(]\s*\d+\s*[)）]\s*|\d+\s*[.、)．]\s*|[-•·*+]\s*)/;
const COMMENT = /^\s*(?:#|\/\/|※|＊|\*)/;
const EXAMPLE_HEAD = /^(?:例|例句|例文|eg\.?|ex\.?)\s*[:：]?\s*/i;

const PAREN = /^(.+?)\s*[（(【\[]\s*(.+?)\s*[)）】\]]\s*$/;
const EQUALS = /^(.+?)\s*[=＝]\s*(.+)$/;

const KANA = /^[\u3040-\u309f\u30a0-\u30ff\u30fc\u30fb\s]+$/;

function looksLikeWordRow(cells: string[]): boolean {
  if (cells.length < 2 || cells.length > 5) return false;
  return KANA.test(cells[0].trim()) || PAREN.test(cells[0].trim());
}

function splitCells(line: string): string[] {
  const normalized = line.replace(/\u3000+/g, "\t");
  const attempts: Array<{ re: RegExp; strict: boolean }> = [
    { re: /\t+/, strict: false },
    { re: / {2,}/, strict: false },
    { re: /\s*[|｜]\s*/, strict: false },
    { re: /\s*[,，;；]\s*/, strict: true },
    { re: / +/, strict: true },
  ];
  for (const { re, strict } of attempts) {
    const cells = normalized
      .split(re)
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    if (strict && !looksLikeWordRow(cells)) continue;
    return cells;
  }
  return [line.trim()];
}

/** `私（わたし）` / `わたし（私）` / `私＝わたし` */
function unwrapPair(cell: string): { kana: string; kanji: string } | null {
  for (const re of [PAREN, EQUALS]) {
    const m = cell.match(re);
    if (!m) continue;
    const a = m[1].trim();
    const b = m[2].trim();
    if (asPos(a) || asPos(b)) continue;
    if (KANA.test(a) && !KANA.test(b)) return { kana: a, kanji: b };
    if (KANA.test(b) && !KANA.test(a)) return { kana: b, kanji: a };
  }
  return null;
}

function stripNoise(raw: string): string {
  return raw.replace(ORDINAL, "").replace(/[\u200b-\u200f\ufeff]/g, "").trim();
}

function parseRow(line: string): WordDraft | null {
  let cells = splitCells(line);
  if (!cells.length) return null;

  // Written form first, e.g. 「食べる たべる」 — swap so kana leads.
  if (
    cells.length >= 2 &&
    hasKanji(cells[0]) &&
    !asPos(cells[0]) &&
    isKanaOnly(cells[1])
  ) {
    cells = [cells[1], cells[0], ...cells.slice(2)];
  }

  let kana = "";
  let kanji = "";

  const inline = unwrapPair(cells[0]);
  if (inline) {
    kana = inline.kana;
    kanji = inline.kanji;
    cells = cells.slice(1);
  } else if (cells.length >= 2 && isKanaOnly(cells[0])) {
    kana = cells[0].trim();
    cells = cells.slice(1);
    // A dash where the kanji would be: the word has none, and the next cell is
    // already the meaning.
    if (cells.length && BLANK_CELL.test(cells[0])) {
      cells = cells.slice(1);
    } else if (
      cells.length >= 2 &&
      hasKanji(cells[0]) &&
      !asPos(cells[0]) &&
      cells[0].length <= 10
    ) {
      kanji = cells[0].trim();
      cells = cells.slice(1);
    }
  } else {
    return null;
  }

  let pos = "";
  const meaningParts: string[] = [];
  for (const cell of cells) {
    const p = asPos(cell);
    if (p && !pos) {
      pos = p;
      continue;
    }
    meaningParts.push(cell);
  }

  const meaning = meaningParts.join(" ").trim();
  if (!kana || (!meaning && !kanji)) return null;

  return {
    kana,
    kanji,
    meaning,
    pos,
    pitch: null,
    examples: [],
    note: "",
  };
}

function splitExample(line: string): { jp: string; cn: string } {
  const body = line.replace(EXAMPLE_HEAD, "").trim();
  const parts = body.split(/\s*[／/｜|]\s*/);
  if (parts.length >= 2) {
    return { jp: parts[0].trim(), cn: parts.slice(1).join(" ").trim() };
  }
  return { jp: body, cn: "" };
}

export function parseWordList(raw: string): ParseOutcome {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const words: WordDraft[] = [];
  let skipped = 0;

  for (const original of lines) {
    if (COMMENT.test(original)) continue;
    const line = stripNoise(original);
    if (!line) continue;

    if (EXAMPLE_HEAD.test(line) && words.length > 0) {
      const ex = splitExample(line);
      if (ex.jp) {
        words[words.length - 1].examples.push(ex);
        continue;
      }
    }

    const draft = parseRow(line);
    if (draft) {
      words.push(draft);
    } else {
      skipped += 1;
    }
  }

  const quality: ParseOutcome["quality"] =
    words.length === 0
      ? "empty"
      : words.length / (words.length + skipped) < 0.5
        ? "poor"
        : "ok";

  return { words, skipped, quality };
}

/** Stable identity used to avoid importing the same word twice. */
export function wordKey(w: { kana: string; kanji: string }): string {
  return `${w.kana}::${w.kanji}`.replace(/\s+/g, "");
}
