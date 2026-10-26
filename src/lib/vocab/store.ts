import { DEFAULT_AI, type AiConfig } from "./ai";
import type { VocabWord } from "./types";

const WORDS_KEY = "wb.vocab.words.v1";
const AI_KEY = "wb.vocab.ai.v1";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Rebuild every record from known fields only, so old saves stay clean. */
function revive(w: Record<string, unknown>): VocabWord {
  return {
    id: str(w.id),
    kana: str(w.kana),
    kanji: str(w.kanji),
    meaning: str(w.meaning),
    pos: str(w.pos),
    pitch: typeof w.pitch === "number" ? w.pitch : null,
    examples: Array.isArray(w.examples)
      ? w.examples
          .map((e) => {
            const ex = (e ?? {}) as Record<string, unknown>;
            return { jp: str(ex.jp), cn: str(ex.cn) };
          })
          .filter((e) => e.jp)
      : [],
    note: str(w.note),
    tags: Array.isArray(w.tags) ? w.tags.filter((t) => typeof t === "string") : [],
    createdAt: typeof w.createdAt === "number" ? w.createdAt : 0,
  };
}

export function loadWords(): VocabWord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (w): w is Record<string, unknown> =>
          !!w && typeof w.kana === "string" && typeof w.id === "string"
      )
      .map(revive);
  } catch {
    return [];
  }
}

export function saveWords(words: VocabWord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(WORDS_KEY, JSON.stringify(words));
  } catch {
    /* quota exceeded — the in-memory list still works this session */
  }
}

export function loadAiConfig(): AiConfig {
  if (typeof localStorage === "undefined") return { ...DEFAULT_AI };
  try {
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return { ...DEFAULT_AI };
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return {
      key: typeof parsed.key === "string" ? parsed.key : "",
      base: typeof parsed.base === "string" && parsed.base ? parsed.base : DEFAULT_AI.base,
      model:
        typeof parsed.model === "string" && parsed.model
          ? parsed.model
          : DEFAULT_AI.model,
    };
  } catch {
    return { ...DEFAULT_AI };
  }
}

export function saveAiConfig(cfg: AiConfig): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(AI_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}
