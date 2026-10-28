import { splitMora } from "./pitch";
import { splitAnnotated } from "./ruby";
import { asPos, type VocabExample, type WordDraft } from "./types";

export interface AiConfig {
  key: string;
  base: string;
  model: string;
}

export const DEFAULT_AI: AiConfig = {
  key: "",
  base: "https://api.deepseek.com",
  model: "deepseek-flash",
};

export const MODEL_HINTS = ["deepseek-flash", "deepseek-chat", "deepseek-reasoner"];

const SYSTEM = `你是日语词汇数据结构化工具。任务是把用户提供的日语单词表整理成 JSON。
除例句之外，你不创作、不补充、不猜测原文里没有的信息。例句是唯一允许你编写的字段。`;

/** Shared by every path that has to produce a kana reading for a sentence. */
const RUBY_RULE = `- ruby：jp 的注音版。每一串连续的汉字后面紧跟方括号，括号里写这串汉字的平假名读音，假名和标点原样保留。
  例：「今日は雨です」→「今日[きょう]は雨[あめ]です」；「学校へ行きます」→「学校[がっこう]へ行[い]きます」；「兄弟が二人います」→「兄弟[きょうだい]が二人[ふたり]います」。
  送假名不括进括号，只括汉字部分；一个汉字一个括号，不要整句连注。`;

const FIELD_SPEC = `输出格式（严格 JSON，不要 markdown 代码块）：
{"words":[{"kana":"","kanji":"","meaning":"","pos":"","pitch":null,"examples":[{"jp":"","ruby":"","cn":""}],"note":""}]}

字段规则：
- kana：假名读音，纯平假名或片假名，可含「ー」「・」。必填，不能为空。
- kanji：汉字写法，含送假名（如「食べる」）。没有汉字时用空字符串。
- meaning：中文释义。原文是日文解释的，译成中文。
- pos：词性，只能取 [名] [代] [动1] [动2] [动3] [形1] [形2] [副] [连体] [接续] [感] [数] [助] 之一，判断不了用空字符串。
- pitch：声调，只在原文明确写出数字时填。见下方「声调」一节。
- examples：例句数组，每个词至少一句。见下方「例句」一节。
- note：原文的附注、易混提示、记忆点，没有就空字符串。

例句：
- 原文给了例句就照抄，同样要补 ruby。
- 原文没有就自己写一句：8～14 个假名长度、日常口语、只用这个词的常见搭配。宁可句子朴素，也不要生造搭配或用错的助词。
- jp：句子本身，只含日文和标点，**不要出现方括号**。
- cn：中文翻译。
${RUBY_RULE}

声调（重要）：
- 只有原文明写数字时才填，例如词后带圈数字 ⓪①②③④、或方括号里的 [0] [1] [2]、或表格里的「声调」列。
- 带圈数字 ⓪ 表示 0，① 表示 1，依此类推。
- **假名上方/下方的折线（音调曲线）不是数字，一律忽略，不要尝试从折线的起伏推断声调。** 遇到折线时 pitch 必须填 null。
- 没有明写数字就填 null。绝对不要凭语感猜声调。

硬性要求：
1. 除例句外，不得编造原文没有的信息。
2. 折线不是声调数据，不要转换、不要推测。
3. 词条数量必须与原文一致，不合并、不遗漏、不排序。
4. 只输出 JSON 对象本身。`;

export class AiError extends Error {}

interface ChatMessage {
  role: "system" | "user";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

function endpoint(base: string): string {
  const b = (base || DEFAULT_AI.base).trim().replace(/\/+$/, "");
  if (b.endsWith("/chat/completions")) return b;
  return `${b}/chat/completions`;
}

async function send(
  cfg: AiConfig,
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response> {
  if (!cfg.key.trim()) throw new AiError("还没有填写 API Key");

  let res: Response;
  try {
    res = await fetch(endpoint(cfg.base), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.key.trim()}`,
      },
      body: JSON.stringify({ model: cfg.model || DEFAULT_AI.model, ...body }),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new AiError("网络不通，或者接口地址不对。也可以换一个支持跨域的地址再试。");
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 401) throw new AiError("API Key 无效或已过期");
    if (res.status === 402) throw new AiError("账户余额不足");
    if (res.status === 404) throw new AiError("接口地址或模型名不存在，检查一下设置");
    if (res.status === 429) throw new AiError("请求太频繁，等几秒再试");
    throw new AiError(
      `接口返回 ${res.status}${detail ? `：${detail.slice(0, 180)}` : ""}`
    );
  }
  return res;
}

async function chat(
  cfg: AiConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const res = await send(
    cfg,
    {
      messages,
      temperature: 0.1,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    },
    signal
  );

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AiError("模型返回了空内容，重试一次试试");
  }
  return content;
}

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Plain-text chat, streamed. `onDelta` gets each new fragment plus the text
 * assembled so far, so the component never has to rebuild it.
 */
export async function chatReply(
  turns: ChatTurn[],
  cfg: AiConfig,
  onDelta: (full: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await send(
    cfg,
    { messages: turns, temperature: 0.4, stream: true },
    signal
  );

  if (!res.body) {
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string") throw new AiError("模型返回了空内容");
    onDelta(text);
    return text;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  let done = false;

  while (!done) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        done = true;
        break;
      }
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          full += delta;
          onDelta(full);
        }
      } catch {
        /* keep-alive or partial frame */
      }
    }
  }

  if (!full.trim()) throw new AiError("模型没有返回内容，重试一次");
  return full;
}

function pickJson(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new AiError("模型没有返回合法 JSON，重试一次");
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * One example, whether the reading arrived in its own field or was written
 * into the sentence. A reading that does not match its sentence is dropped
 * rather than drawn over the wrong characters.
 */
export function toExample(raw: unknown): VocabExample {
  const ex = (raw ?? {}) as Record<string, unknown>;
  const clean = splitAnnotated(str(ex.jp));
  let ruby = clean.ruby;
  const given = str(ex.ruby);
  if (given) {
    const parsed = splitAnnotated(given);
    if (parsed.jp === clean.jp) ruby = parsed.ruby;
  }
  const out: VocabExample = { jp: clean.jp, cn: str(ex.cn) };
  if (ruby) out.ruby = ruby;
  return out;
}

/**
 * Turn whatever the model produced into rows we trust enough to show.
 * Anything structurally impossible is dropped rather than repaired silently.
 */
export function normalizeDrafts(raw: unknown): WordDraft[] {
  const payload = raw as { words?: unknown } | unknown[];
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.words)
      ? payload.words
      : [];

  const out: WordDraft[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;

    let kana = str(r.kana);
    let kanji = str(r.kanji);
    if (!kana) continue;

    // If the model put the written form in kana, swap instead of discarding.
    if (/[\u4e00-\u9fff]/.test(kana)) {
      if (!kanji) kanji = kana;
      kana = str(r.yomi) || "";
      if (!kana) continue;
    }

    const meaning = str(r.meaning);
    if (!meaning && !kanji) continue;

    const examples: VocabExample[] = Array.isArray(r.examples)
      ? r.examples
          .map((e) => toExample(e))
          .filter((e) => e.jp.length > 0)
      : [];

    const rawPitch = r.pitch;
    let pitch: number | null = null;
    if (typeof rawPitch === "number" && Number.isFinite(rawPitch)) {
      const p = Math.round(rawPitch);
      const mora = splitMora(kana).length;
      if (p >= 0 && p <= mora + 1) pitch = p;
    }

    out.push({
      kana,
      kanji,
      meaning,
      pos: asPos(str(r.pos)) ?? "",
      pitch,
      examples,
      note: str(r.note),
    });
  }
  return out;
}

const BATCH_LINES = 60;

function chunkLines(raw: string, size: number): string[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const batches: string[] = [];
  for (let i = 0; i < lines.length; i += size) {
    batches.push(lines.slice(i, i + size).join("\n"));
  }
  return batches.length ? batches : [raw];
}

export interface StructureOptions {
  text?: string;
  imageDataUrl?: string;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

export async function aiStructure(
  opts: StructureOptions,
  cfg: AiConfig
): Promise<WordDraft[]> {
  const instruction = `${FIELD_SPEC}\n\n把下面的日语单词表转成 JSON 对象。`;

  // Image path: one request, model reads the picture directly.
  if (opts.imageDataUrl) {
    const content = await chat(
      cfg,
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `图片是一张日语单词表（截图、拍照或扫描件都算），常见的是《新版中日交流标准日本语》的单词表。

这类表的一个特点：假名上方画着音调折线。折线是图形，不是文字——
- 不要把折线读成长音符「ー」、片假名「へ」「ノ」或任何字符；
- 不要把折线连成的起伏当作声调数字，pitch 一律填 null；
- 只转录折线、圆圈数字之外的正文。

先准确识别图中的文字，再按规则结构化。识别不清的字符不要猜：该字段留空字符串，并在 note 里写「识别不清」。
词性如果印成下划线加小字（如「名」「动1」），照抄即可。

${instruction}`,
            },
            { type: "image_url", image_url: { url: opts.imageDataUrl } },
          ],
        },
      ],
      opts.signal
    );
    opts.onProgress?.(1, 1);
    return normalizeDrafts(pickJson(content));
  }

  const raw = (opts.text ?? "").trim();
  if (!raw) throw new AiError("没有可整理的内容");

  const batches = chunkLines(raw, BATCH_LINES);
  const all: WordDraft[] = [];
  for (let i = 0; i < batches.length; i++) {
    const content = await chat(
      cfg,
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `${instruction}\n\n原文：\n"""\n${batches[i]}\n"""`,
        },
      ],
      opts.signal
    );
    all.push(...normalizeDrafts(pickJson(content)));
    opts.onProgress?.(i + 1, batches.length);
  }
  return all;
}

const EXAMPLE_SPEC = `输出格式（严格 JSON，不要 markdown 代码块）：
{"sentences":[{"i":1,"jp":"","ruby":"","cn":""}]}

规则：
- i：对应下面列表里的序号，原样照抄，不要重排。
- jp：为这个词写一句例句：8～14 个假名长度、日常口语、只用这个词的常见搭配。宁可句子朴素，也不要生造搭配或用错的助词。
- cn：中文翻译。
${RUBY_RULE}
- 列表里有几个词就返回几条，不合并、不遗漏。只输出 JSON 对象本身。`;

const EXAMPLE_CHUNK = 40;

/**
 * Examples for words that arrived without any — the local parser never writes
 * prose, so this is what makes "every word has an example" true on that path.
 */
export async function aiFillExamples(
  drafts: WordDraft[],
  cfg: AiConfig,
  onProgress?: (done: number, total: number) => void
): Promise<WordDraft[]> {
  const out = drafts.map((d) => ({ ...d }));
  const todo = out
    .map((d, i) => ({ d, i }))
    .filter((r) => r.d.examples.length === 0);
  if (!todo.length) return out;

  for (let start = 0; start < todo.length; start += EXAMPLE_CHUNK) {
    const slice = todo.slice(start, start + EXAMPLE_CHUNK);
    const list = slice
      .map(
        (r, k) =>
          `${k + 1}. ${r.d.kanji || r.d.kana}（${r.d.kana}）${
            r.d.pos ? `[${r.d.pos}]` : ""
          } ${r.d.meaning}`
      )
      .join("\n");

    const content = await chat(cfg, [
      { role: "system", content: SYSTEM },
      { role: "user", content: `${EXAMPLE_SPEC}\n\n单词表：\n${list}` },
    ]);

    const payload = pickJson(content) as { sentences?: unknown };
    if (Array.isArray(payload?.sentences)) {
      for (const item of payload.sentences) {
        const row = item as Record<string, unknown>;
        const n = Number(row.i);
        const target = slice[Math.round(n) - 1];
        if (!Number.isFinite(n) || !target) continue;
        const ex = toExample(row);
        // `i` is the model's own numbering; only take it if it points at a
        // word that had nothing, so a miscount cannot overwrite real data.
        if (ex.jp && out[target.i].examples.length === 0) {
          out[target.i].examples = [ex];
        }
      }
    }
    onProgress?.(Math.min(start + EXAMPLE_CHUNK, todo.length), todo.length);
  }
  return out;
}

const READINGS_SPEC = `输出格式（严格 JSON，不要 markdown 代码块）：
{"readings":[{"i":1,"ruby":""}]}

规则：
- i：对应下面句子的序号，原样照抄。
- ruby：把该句的汉字加上方括号注音，汉字以外的字符（假名、标点、数字）完全照抄，一个字都不要改、不要增删。
${RUBY_RULE}
- 句子有几条就返回几条。只输出 JSON 对象本身。`;

/**
 * Add readings to sentences that were stored before annotations existed.
 * Returns one entry per input, empty string where no reading came back.
 */
export async function aiAnnotate(
  sentences: string[],
  cfg: AiConfig
): Promise<string[]> {
  const out = sentences.map(() => "");
  const CHUNK = 40;
  for (let start = 0; start < sentences.length; start += CHUNK) {
    const slice = sentences.slice(start, start + CHUNK);
    const list = slice.map((s, k) => `${k + 1}. ${s}`).join("\n");
    const content = await chat(cfg, [
      { role: "system", content: SYSTEM },
      { role: "user", content: `${READINGS_SPEC}\n\n句子：\n${list}` },
    ]);
    const payload = pickJson(content) as { readings?: unknown };
    if (!Array.isArray(payload?.readings)) continue;
    for (const item of payload.readings) {
      const row = item as Record<string, unknown>;
      const n = Math.round(Number(row.i));
      const idx = start + n - 1;
      if (!Number.isFinite(n) || idx < start || idx >= start + slice.length) continue;
      const parsed = splitAnnotated(str(row.ruby));
      // The reading is only usable if the model kept the sentence intact.
      if (parsed.ruby && parsed.jp === sentences[idx]) out[idx] = parsed.ruby;
    }
  }
  return out;
}

/**
 * Add readings to every example that lacks them. Sentences are deduplicated,
 * so a repeated sentence costs one line, and untouched items keep identity.
 */
export async function aiAnnotateDrafts<T extends { examples: VocabExample[] }>(
  items: T[],
  cfg: AiConfig
): Promise<T[]> {
  const sentences = Array.from(
    new Set(items.flatMap((w) => w.examples.filter((e) => !e.ruby).map((e) => e.jp)))
  );
  if (!sentences.length) return items;

  const readings = await aiAnnotate(sentences, cfg);
  const got = new Map<string, string>();
  sentences.forEach((s, i) => {
    if (readings[i]) got.set(s, readings[i]);
  });
  if (!got.size) return items;

  return items.map((w) => ({
    ...w,
    examples: w.examples.map((e) => {
      const ruby = e.ruby ? undefined : got.get(e.jp);
      return ruby ? { ...e, ruby } : e;
    }),
  }));
}

/** Downscale before upload: keeps the request small and the text equally readable. */export async function imageToDataUrl(file: File, maxSide = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AiError("这个浏览器不支持图片处理");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.9);
}
