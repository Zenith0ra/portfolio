/** What the question side of the card shows. */
export type CardMode = "cn" | "kanji" | "kana" | "audio";

export interface VocabExample {
  jp: string;
  cn: string;
  /** jp with readings inline: 今日[きょう]は雨[あめ]です */
  ruby?: string;
}

/** Fields that describe the word itself. */
export interface WordDraft {
  kana: string;
  kanji: string;
  meaning: string;
  pos: string;
  /** 0 = heiban, 1 = atamadaka, n = drop after mora n. null when unknown. */
  pitch: number | null;
  examples: VocabExample[];
  note: string;
}

export interface VocabWord extends WordDraft {
  id: string;
  tags: string[];
  createdAt: number;
}

export const EMPTY_DRAFT: WordDraft = {
  kana: "",
  kanji: "",
  meaning: "",
  pos: "",
  pitch: null,
  examples: [],
  note: "",
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function draftToWord(draft: WordDraft, tags: string[] = []): VocabWord {
  return {
    ...EMPTY_DRAFT,
    ...draft,
    examples: draft.examples ?? [],
    id: newId(),
    tags,
    createdAt: Date.now(),
  };
}

/** Kana only: hiragana, katakana, prolonged sound mark, middle dot, spaces. */
const KANA_ONLY = /^[\u3040-\u309f\u30a0-\u30ff\u30fc\u30fb\s]+$/;
const HAS_KANJI = /[\u4e00-\u9fff\u3400-\u4dbf]/;

export function isKanaOnly(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && KANA_ONLY.test(t);
}

export function hasKanji(s: string): boolean {
  return HAS_KANJI.test(s);
}

/** A dash standing in for "this word has no kanji", as the OCR writes it. */
export const BLANK_CELL = /^[-—–―－/／]+$/;

/** Part-of-speech labels used by 新标日 and most word lists. */
const POS_WORDS = [
  "名", "代", "动", "動", "形", "副", "助", "连体", "連体",
  "接续", "接続", "感", "数", "量", "惯用", "慣用", "连语", "連語",
  // 新标日 also tags these three; the OCR path now preserves them.
  "疑", "专", "專", "连", "連",
];

export function asPos(raw: string): string | null {
  const t = raw.trim().replace(/^[\[【(（]\s*|\s*[\]】)）]$/g, "");
  if (!t) return null;
  // [动1] [形2] [名] [副]
  if (/^(动|動)[123]?$/.test(t) || /^形[12]?$/.test(t)) return t;
  if (POS_WORDS.includes(t)) return t;
  // latin shorthand
  if (/^(n|v|vt|vi|adj|adv|pron|conj|int)\.?$/i.test(t)) {
    const map: Record<string, string> = {
      n: "名", v: "动", vt: "动他", vi: "动自", adj: "形",
      adv: "副", pron: "代", conj: "接续", int: "感",
    };
    return map[t.replace(/\.$/, "").toLowerCase()] ?? t;
  }
  return null;
}
