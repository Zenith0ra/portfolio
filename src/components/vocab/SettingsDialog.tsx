"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Volume2, X } from "lucide-react";
import {
  aiStructure,
  DEFAULT_AI,
  MODEL_HINTS,
  type AiConfig,
} from "@/lib/vocab/ai";
import {
  getVoiceName,
  listJaVoices,
  setVoice,
  speakJa,
  type VoiceOption,
} from "@/lib/vocab/speech";

interface Props {
  open: boolean;
  cfg: AiConfig;
  onSave: (cfg: AiConfig) => void;
  onClose: () => void;
}

export function SettingsDialog({ open, cfg, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AiConfig>(cfg);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voice, setVoiceState] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(cfg);
    setResult(null);
    setVoiceState(getVoiceName());

    const read = () => setVoices(listJaVoices());
    read();
    window.speechSynthesis?.addEventListener("voiceschanged", read);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", read);
  }, [open, cfg]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function test() {
    setTesting(true);
    setResult(null);
    try {
      const words = await aiStructure(
        { text: "がくせい 学生 [名] 学生\nほん 本 [名] 书" },
        draft
      );
      setResult({ ok: true, msg: `连接正常，返回 ${words.length} 个词` });
    } catch (err) {
      setResult({ ok: false, msg: (err as Error).message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <h2 className="text-[14px] font-medium text-white">设置</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-zinc-400">API Key</span>
            <input
              type="password"
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              placeholder="sk-..."
              autoComplete="off"
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] text-zinc-400">接口地址</span>
            <input
              value={draft.base}
              onChange={(e) => setDraft({ ...draft, base: e.target.value })}
              placeholder={DEFAULT_AI.base}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[12px] text-zinc-400">模型</span>
            <input
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-zinc-200 focus:border-purple-500/50 focus:outline-none"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {MODEL_HINTS.map((m) => (
                <button
                  key={m}
                  onClick={() => setDraft({ ...draft, model: m })}
                  className={`rounded border px-1.5 py-0.5 text-[11px] transition-colors ${
                    draft.model === m
                      ? "border-purple-400/40 bg-purple-500/10 text-purple-300"
                      : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-[12px] text-zinc-400">日语语音</span>
            <div className="flex gap-2">
              <select
                value={voice ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  setVoiceState(v);
                  setVoice(v);
                  speakJa("あめ", 0.9);
                }}
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-2 text-[12px] text-zinc-200 focus:border-purple-500/50 focus:outline-none"
              >
                <option value="">
                  {voices.length ? "自动" : "没有日语语音"}
                </option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                    {v.natural ? "" : " · 机械音"}
                  </option>
                ))}
              </select>
              <button
                onClick={() => speakJa("あめ", 0.9)}
                disabled={!voices.length}
                className="shrink-0 rounded-md border border-white/10 px-2.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
                title="试听"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-[12px] ${
                result.ok
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              {result.ok ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span className="leading-relaxed">{result.msg}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3.5">
          <button
            onClick={test}
            disabled={testing || !draft.key.trim()}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            验证
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-[12px] text-zinc-500 transition-colors hover:text-white"
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(draft);
                onClose();
              }}
              className="rounded-md bg-purple-600 px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-purple-500"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
