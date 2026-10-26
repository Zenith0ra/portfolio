import { splitMora } from "./pitch";
import type { WordDraft } from "./types";

/**
 * Pitch accent dictionary.
 *
 * Source: Kanjium's `accents.txt`, itself compiled from the NHK 日本語発音
 * アクセント新辞典 — 124k headwords covering standard Tokyo Japanese.
 * Shipped as a static asset and fetched lazily: 2.8 MB raw, ~960 KB gzipped,
 * downloaded once and then served from the HTTP cache.
 *
 * Line format: `<kana>\t<word>=<accent>[,<accent>] <word>=<accent> …`
 */

const ACCENT_URL = "/vocab/accent.v1.txt";

let table: Map<string, string> | null = null;
let pending: Promise<boolean> | null = null;
let failed = false;

export function accentLoaded(): boolean {
  return table !== null;
}

export function accentFailed(): boolean {
  return failed;
}

/** Idempotent; concurrent callers share one request. */
export function loadAccent(): Promise<boolean> {
  if (table) return Promise.resolve(true);
  if (pending) return pending;

  pending = fetch(ACCENT_URL, { cache: "force-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.text();
    })
    .then((text) => {
      const map = new Map<string, string>();
      for (const line of text.split("\n")) {
        const tab = line.indexOf("\t");
        if (tab <= 0) continue;
        map.set(line.slice(0, tab), line.slice(tab + 1));
      }
      table = map;
      return true;
    })
    .catch(() => {
      failed = true;
      return false;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/** Katakana → hiragana, drop spaces and bracketed notes. */
export function normKana(raw: string): string {
  return raw
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    )
    .replace(/[\s\u3000・、。.,]/g, "")
    .trim();
}

function normWord(raw: string): string {
  return raw
    .replace(/[\s\u3000]/g, "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .trim();
}

interface Entry {
  word: string;
  accents: number[];
}

function parseRow(row: string): Entry[] {
  const out: Entry[] = [];
  for (const seg of row.split(" ")) {
    const eq = seg.lastIndexOf("=");
    if (eq <= 0) continue;
    const accents = seg
      .slice(eq + 1)
      .split(",")
      .map((n) => parseInt(n, 10))
      .filter((n) => Number.isFinite(n));
    if (!accents.length) continue;
    out.push({ word: seg.slice(0, eq), accents });
  }
  return out;
}

export interface PitchHit {
  pitch: number;
  /** The headword in the dictionary matched the kanji we were given. */
  verified: boolean;
}

/**
 * Look up the accent of `kana`, disambiguated by `kanji` when homophones
 * differ. Returns null rather than guessing: for 箸/橋/端 the accent is the
 * whole point, and a coin flip would teach the wrong thing.
 */
export function lookupPitch(kana: string, kanji = ""): PitchHit | null {
  if (!table) return null;
  const key = normKana(kana);
  if (!key) return null;

  const row = table.get(key);
  if (!row) return null;

  const entries = parseRow(row);
  if (!entries.length) return null;

  const mora = splitMora(key).length;
  const valid = (n: number) => n >= 0 && n <= mora + 1;

  const word = normWord(kanji);
  if (word) {
    const exact = entries.find((e) => normWord(e.word) === word);
    if (exact) {
      const p = exact.accents.find(valid);
      return p === undefined ? null : { pitch: p, verified: true };
    }
  }

  // A single headword can carry two accepted accents (美味しい = 0 or 3); the
  // first is the primary one, so with nothing to disambiguate it is safe.
  if (entries.length === 1) {
    const p = entries[0].accents.find(valid);
    return p === undefined ? null : { pitch: p, verified: false };
  }

  // Several homophones: only trust the reading when every sense agrees.
  const candidates = new Set<number>();
  for (const e of entries) for (const a of e.accents) if (valid(a)) candidates.add(a);
  if (candidates.size === 1) {
    return { pitch: [...candidates][0], verified: false };
  }
  return null;
}

export type DictState = "verified" | "reading-only" | "unknown";

export interface FillResult {
  drafts: WordDraft[];
  verified: number;
  readingOnly: number;
  unknown: number;
  suspect: number;
  /** Row indexes whose kanji is not a headword of its own reading. */
  suspectAt: number[];
}

/**
 * Overwrite pitches with dictionary values. A model reading a photo has no
 * business guessing accent, and even when the textbook prints it, the
 * dictionary is the same standard and is complete.
 */
export function applyPitch(drafts: WordDraft[]): FillResult {
  let verified = 0;
  let readingOnly = 0;
  let unknown = 0;
  const suspectAt: number[] = [];

  const out = drafts.map((d, i) => {
    const hit = lookupPitch(d.kana, d.kanji);
    if (!hit) {
      unknown += 1;
      return d;
    }
    if (hit.verified) {
      verified += 1;
    } else {
      readingOnly += 1;
      // A kanji we could not find under its own reading usually means the
      // model misread one of the two. Not proof — the textbook may have a
      // word the dictionary lacks — so this only raises a flag.
      if (normWord(d.kanji)) suspectAt.push(i);
    }
    return { ...d, pitch: hit.pitch };
  });

  return {
    drafts: out,
    verified,
    readingOnly,
    unknown,
    suspect: suspectAt.length,
    suspectAt,
  };
}
