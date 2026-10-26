import { splitMora } from "./pitch";
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

const SYSTEM = `你是日语词汇数据结构化工具。唯一任务是把用户提供的日语单词表整理成 JSON。
你不创作、不补充、不猜测原文里没有的信息。`;

/** Same role, plus the one thing we do allow it to write from scratch. */
const SYSTEM_WITH_EXAMPLES = `你是日语词汇数据结构化工具。唯一任务是把用户提供的日语单词表整理成 JSON。
除了例句之外，你不创作、不补充、不猜测原文里没有的信息。例句是唯一允许你编写的字段。`;

const FIELD_SPEC = `输出格式（严格 JSON，不要 markdown 代码块）：
{"words":[{"kana":"","kanji":"","meaning":"","pos":"","pitch":null,"examples":[{"jp":"","cn":""}],"note":""}]}

字段规则：
- kana：假名读音，纯平假名或片假名，可含「ー」「・」。必填，不能为空。
- kanji：汉字写法，含送假名（如「食べる」）。没有汉字时用空字符串。
- meaning：中文释义。原文是日文解释的，译成中文。
- pos：词性，只能取 [名] [代] [动1] [动2] [动3] [形1] [形2] [副] [连体] [接续] [感] [数] [助] 之一，判断不了用空字符串。
- pitch：声调，只在原文明确写出数字时填。见下方「声调」一节。
- examples：例句数组。${"@EXAMPLES@"}
- note：原文的附注、易混提示、记忆点，没有就空字符串。

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

/** Rule for the `examples` field, which flips depending on the checkbox. */
const EXAMPLES_COPY = "原文给了例句就照抄，没有就填空数组。";
const EXAMPLES_WRITE =
  "原文给了例句就照抄。没有就给每个词补一句：8～14 个假名长度、日常口语、只用这个词的常见搭配，cn 写中文翻译。宁可句子朴素，也不要生造搭配或用错的助词。";

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

async function chat(
  cfg: AiConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  if (!cfg.key.trim()) throw new AiError("还没有填写 API Key");

  let res: Response;
  try {
    res = await fetch(endpoint(cfg.base), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.key.trim()}`,
      },
      body: JSON.stringify({
        model: cfg.model || DEFAULT_AI.model,
        messages,
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new AiError(
      "请求发不出去，可能是网络问题或接口地址不对。也可以换一个支持跨域的接口地址再试。"
    );
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

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AiError("模型返回了空内容，重试一次试试");
  }
  return content;
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
          .map((e) => {
            const ex = (e ?? {}) as Record<string, unknown>;
            return { jp: str(ex.jp), cn: str(ex.cn) };
          })
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
  withExamples?: boolean;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

export async function aiStructure(
  opts: StructureOptions,
  cfg: AiConfig
): Promise<WordDraft[]> {
  const spec = FIELD_SPEC.replace(
    "@EXAMPLES@",
    opts.withExamples ? EXAMPLES_WRITE : EXAMPLES_COPY
  );
  const system = opts.withExamples ? SYSTEM_WITH_EXAMPLES : SYSTEM;
  const instruction = `${spec}\n\n把下面的日语单词表转成 JSON 对象。`;

  // Image path: one request, model reads the picture directly.
  if (opts.imageDataUrl) {
    const content = await chat(
      cfg,
      [
        { role: "system", content: system },
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
        { role: "system", content: system },
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

/** Downscale before upload: keeps the request small and the text equally readable. */
export async function imageToDataUrl(file: File, maxSide = 1600): Promise<string> {
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
