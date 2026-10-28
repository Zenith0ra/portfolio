"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import { AiError, chatReply, type AiConfig, type ChatTurn } from "@/lib/vocab/ai";
import type { VocabWord } from "@/lib/vocab/types";

const SYSTEM = `你在陪一个中国学生背日语单词，教材是《新版中日交流标准日本语》。
用中文回答，直接给答案，不要客套、不要总结、不要复述问题。
每条用户消息开头有一个【当前卡片】块，说明此刻屏幕上的词；【提问】后面才是要回答的内容。
回答里出现日语时标出假名读音；给例句时写日文，另起一行给中文翻译。
不确定就说不确定，不要编。`;

const QUICK: { label: string; ask: string }[] = [
  { label: "怎么用", ask: "这个词怎么用？给两个例句。" },
  { label: "近义词", ask: "它跟意思相近的词有什么区别？" },
  { label: "怎么记", ask: "这个词怎么记？" },
];

interface Msg {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  word: VocabWord | null;
  cfg: AiConfig;
  onOpenSettings: () => void;
}

function cardContext(word: VocabWord | null): string {
  if (!word) return "";
  const lines = [`假名：${word.kana}`];
  if (word.kanji) lines.push(`汉字：${word.kanji}`);
  if (word.pos) lines.push(`词性：${word.pos}`);
  if (word.pitch !== null) lines.push(`声调：${word.pitch}`);
  if (word.meaning) lines.push(`释义：${word.meaning}`);
  for (const ex of word.examples) {
    lines.push(`例句：${ex.jp}${ex.cn ? `（${ex.cn}）` : ""}`);
  }
  return lines.join("\n");
}

export function AiChat({ word, cfg, onOpenSettings }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      if (!cfg.key.trim()) {
        setError("先填 API Key");
        onOpenSettings();
        return;
      }
      setError(null);
      setInput("");
      setBusy(true);

      const ctx = cardContext(word);
      const turns: ChatTurn[] = [
        { role: "system", content: SYSTEM },
        ...messages.map((m) => ({ role: m.role, content: m.text })),
        {
          role: "user",
          content: ctx ? `【当前卡片】\n${ctx}\n\n【提问】\n${text}` : text,
        },
      ];

      setMessages((prev) => [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: "" },
      ]);

      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        await chatReply(
          turns,
          cfg,
          (full) =>
            setMessages((prev) => {
              const next = prev.slice();
              const last = next[next.length - 1];
              if (last?.role === "assistant") next[next.length - 1] = { ...last, text: full };
              return next;
            }),
          ctrl.signal
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const msg = err instanceof AiError ? err.message : (err as Error).message;
          setMessages((prev) => {
            const next = prev.slice();
            const last = next[next.length - 1];
            if (last?.role === "assistant" && !last.text) {
              next[next.length - 1] = { ...last, text: msg };
            }
            return next;
          });
          setError(msg);
        }
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, cfg, messages, onOpenSettings, word]
  );

  return (
    <div
      data-chat
      className="flex h-[440px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] lg:h-auto lg:min-h-[420px] lg:w-[340px] lg:shrink-0"
    >
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
        <span className="text-[13.5px] text-zinc-300">问 AI</span>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="rounded p-1 text-zinc-600 transition-colors hover:text-white"
            title="清空"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.ask)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[13px] text-zinc-500 transition-colors hover:border-purple-400/40 hover:text-zinc-200"
              >
                {q.label}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                className="ml-auto w-fit max-w-[86%] rounded-lg bg-purple-500/15 px-3 py-1.5 text-[14px] leading-relaxed text-zinc-100"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                className="whitespace-pre-wrap text-[14px] leading-[1.8] text-zinc-300"
              >
                {m.text || <span className="text-zinc-600">…</span>}
              </div>
            )
          )
        )}
      </div>

      {error && (
        <div className="px-4 pb-1 text-[12px] text-amber-300/80">{error}</div>
      )}

      <div className="border-t border-white/[0.07] p-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            spellCheck={false}
            placeholder="问这个词"
            className="max-h-28 min-h-[36px] flex-1 resize-none rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-[14px] leading-snug text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/40 focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || busy}
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-500 disabled:opacity-30"
            title="发送"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
