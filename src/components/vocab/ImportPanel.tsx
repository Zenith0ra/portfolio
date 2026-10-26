"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  AiError,
  imageToDataUrl,
  aiStructure,
  type AiConfig,
} from "@/lib/vocab/ai";
import { applyPitch, loadAccent, type FillResult } from "@/lib/vocab/accent";
import { parseWordList } from "@/lib/vocab/parse";
import type { WordDraft } from "@/lib/vocab/types";

interface Props {
  cfg: AiConfig;
  hasAiKey: boolean;
  /** there are words already stored, so "清空现有" applies */
  hasWords: boolean;
  onOpenSettings: () => void;
  onImport: (drafts: WordDraft[], tag: string, replace: boolean) => void;
  onCancel?: () => void;
}

type Busy = "parse" | "ai" | "image" | null;

const JP =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif';

const CELL =
  "min-w-0 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12px] text-zinc-200 transition-colors hover:border-white/10 focus:border-purple-500/50 focus:bg-black/30 focus:outline-none";

export function ImportPanel({
  cfg,
  hasAiKey,
  hasWords,
  onOpenSettings,
  onImport,
  onCancel,
}: Props) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");
  const [replace, setReplace] = useState(false);
  const [drafts, setDrafts] = useState<WordDraft[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [fill, setFill] = useState<FillResult | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [withExamples, setWithExamples] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [onlySuspect, setOnlySuspect] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Warm the accent dictionary while the user is still typing or picking files.
  useEffect(() => {
    loadAccent();
  }, []);

  /** Show the rows, then fill pitch from the dictionary. */
  const finish = useCallback(async (list: WordDraft[]) => {
    setDrafts(list);
    setFill(null);
    setOnlySuspect(false);
    const ok = await loadAccent();
    if (!ok) return;
    const res = applyPitch(list);
    setDrafts(res.drafts);
    setFill(res);
  }, []);

  /** Editing a field can change which dictionary entry applies, so redo it. */
  const patch = useCallback(
    (i: number, next: Partial<WordDraft>) => {
      if (!drafts) return;
      const updated = drafts.map((d, idx) => (idx === i ? { ...d, ...next } : d));
      if (fill && ("kana" in next || "kanji" in next)) {
        const res = applyPitch(updated);
        setDrafts(res.drafts);
        setFill(res);
        return;
      }
      setDrafts(updated);
    },
    [drafts, fill]
  );

  const runLocal = useCallback(async () => {
    setError(null);
    const out = parseWordList(text);
    if (out.quality === "empty") {
      setError("没认出词条");
      setDrafts(null);
      return;
    }
    setSkipped(out.skipped);
    await finish(out.words);
  }, [text, finish]);

  const runAi = useCallback(async () => {
    if (!hasAiKey) {
      setError("先填 API Key");
      onOpenSettings();
      return;
    }
    setError(null);
    setBusy("ai");
    try {
      const out = await aiStructure({ text, withExamples }, cfg);
      if (!out.length) {
        setError("AI 没有返回可用词条，检查一下原文");
        return;
      }
      setSkipped(0);
      await finish(out);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          err instanceof AiError ? err.message : (err as Error).message
        );
      }
    } finally {
      setBusy(null);
    }
  }, [cfg, hasAiKey, text, withExamples, onOpenSettings, finish]);

  const runImages = useCallback(async () => {
    if (!hasAiKey) {
      setError("先填 API Key");
      onOpenSettings();
      return;
    }
    if (!images.length) return;
    setError(null);
    setBusy("image");
    try {
      const all: WordDraft[] = [];
      for (const img of images) {
        all.push(...(await aiStructure({ imageDataUrl: img, withExamples }, cfg)));
      }
      if (!all.length) {
        setError("这张图没读出词条");
        return;
      }
      setSkipped(0);
      await finish(all);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          err instanceof AiError ? err.message : (err as Error).message
        );
      }
    } finally {
      setBusy(null);
    }
  }, [cfg, hasAiKey, images, withExamples, onOpenSettings, finish]);

  const handleFiles = useCallback(async (files: FileList) => {
    const imgFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        imgFiles.push(file);
      } else if (/\.(txt|csv|tsv|md)$/i.test(file.name)) {
        const content = await file.text();
        setText((prev) => (prev ? `${prev}\n${content}` : content));
      }
    }
    if (imgFiles.length) {
      const urls: string[] = [];
      for (const f of imgFiles) {
        try {
          urls.push(await imageToDataUrl(f));
        } catch {
          /* skip unreadable file */
        }
      }
      setImages((prev) => [...prev, ...urls]);
    }
  }, []);

  const reset = () => {
    setDrafts(null);
    setSkipped(0);
    setFill(null);
    setError(null);
    setText("");
    setImages([]);
    setOnlySuspect(false);
  };

  const suspectSet = useMemo(
    () => new Set(fill?.suspectAt ?? []),
    [fill]
  );
  const suspectInfo = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const s of fill?.suspects ?? []) m.set(s.index, s.expected);
    return m;
  }, [fill]);

  const rows = useMemo(() => {
    if (!drafts) return [];
    return drafts
      .map((d, i) => ({ d, i }))
      .filter((r) => !onlySuspect || suspectSet.has(r.i));
  }, [drafts, onlySuspect, suspectSet]);

  // Fixing the last flagged row would otherwise strand the user in a filtered
  // view with no chip left to switch back.
  useEffect(() => {
    if (onlySuspect && fill && fill.suspects.length === 0) setOnlySuspect(false);
  }, [onlySuspect, fill]);

  const exampleCount = drafts?.filter((d) => d.examples.length > 0).length ?? 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`space-y-4 rounded-xl border p-5 transition-colors ${
        dragging ? "border-purple-400/40 bg-purple-500/[0.04]" : "border-white/10"
      }`}
      style={{ background: dragging ? undefined : "#1e1e1e" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-white">导入</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder={`がくせい\t学生\t[名]\t学生\nほん\t本\t[名]\t书\nコーヒー\t\t[名]\t咖啡`}
        className="h-44 w-full resize-y rounded-lg border border-white/10 bg-black/25 px-3.5 py-3 font-mono text-[12.5px] leading-[1.75] text-zinc-300 placeholder:text-zinc-700 focus:border-purple-500/40 focus:outline-none"
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`待识别 ${i + 1}`}
                className="h-16 w-16 rounded-md border border-white/10 object-cover"
              />
              <button
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute -right-1.5 -top-1.5 rounded-full bg-zinc-800 p-0.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <Upload className="h-3.5 w-3.5" />
          文件
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          图片
        </button>

        <div className="mx-1 h-4 w-px bg-white/10" />

        <button
          onClick={runLocal}
          disabled={!text.trim() || busy !== null}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-zinc-300 transition-colors hover:border-purple-400/40 hover:text-white disabled:opacity-40"
        >
          {busy === "parse" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          解析
        </button>

        <button
          onClick={runAi}
          disabled={!text.trim() || busy !== null}
          className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
        >
          {busy === "ai" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          AI 整理
        </button>

        {images.length > 0 && (
          <button
            onClick={runImages}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
          >
            {busy === "image" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            识别图片 {images.length} 张
          </button>
        )}

        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-500">
          <input
            type="checkbox"
            checked={withExamples}
            onChange={(e) => setWithExamples(e.target.checked)}
            className="h-3 w-3 accent-purple-500"
          />
          补例句
        </label>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".txt,.csv,.tsv,.md,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="rounded-md bg-red-500/10 px-3 py-2 text-[12px] leading-relaxed text-red-300">
          {error}
        </div>
      )}

      {drafts && (
        <div className="rounded-lg border border-white/[0.08] bg-black/20">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-300">{drafts.length} 个词</span>
              {skipped > 0 && (
                <span className="text-zinc-600">· {skipped} 行没读懂</span>
              )}
              {fill && (
                <span className="text-zinc-600">
                  · 声调 {drafts.filter((d) => d.pitch !== null).length}/
                  {drafts.length}
                </span>
              )}
              {exampleCount > 0 && (
                <span className="text-zinc-600">· 例句 {exampleCount}</span>
              )}
              {fill && (fill.suspects.length > 0 || onlySuspect) && (
                <button
                  onClick={() => setOnlySuspect((v) => !v)}
                  className={`rounded px-1.5 py-0.5 text-[11.5px] transition-colors ${
                    onlySuspect
                      ? "bg-amber-400/20 text-amber-200"
                      : "bg-amber-400/10 text-amber-300/90 hover:bg-amber-400/15"
                  }`}
                >
                  {onlySuspect
                    ? `全部 ${drafts.length}`
                    : `${fill.suspects.length} 条待核对`}
                </button>
              )}
            </div>
            <button
              onClick={reset}
              className="shrink-0 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
            >
              清空
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-1 text-[10.5px] text-zinc-700">
              <span className="w-28 shrink-0 px-1">假名</span>
              <span className="w-24 shrink-0 px-1">汉字</span>
              <span className="w-10 shrink-0 px-1">词性</span>
              <span className="w-7 shrink-0 px-1">调</span>
              <span className="min-w-0 flex-1 px-1">释义</span>
            </div>
            {rows.length === 0 ? (
              <div className="px-3.5 py-6 text-center text-[11.5px] text-zinc-600">
                没有待核对的词
              </div>
            ) : (
              rows.map(({ d, i }) => {
                const suspect = suspectSet.has(i);
                const expected = suspectInfo.get(i) ?? [];
                return (
                  <div
                    key={i}
                    className={`border-b border-white/[0.04] px-3 py-1 last:border-0 ${
                      suspect ? "bg-amber-500/[0.06]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={d.kana}
                        onChange={(e) => patch(i, { kana: e.target.value })}
                        spellCheck={false}
                        style={{ fontFamily: JP }}
                        className={`${CELL} w-28 shrink-0`}
                      />
                      <input
                        value={d.kanji}
                        onChange={(e) => patch(i, { kanji: e.target.value })}
                        spellCheck={false}
                        style={{ fontFamily: JP }}
                        className={`${CELL} w-24 shrink-0 ${
                          suspect ? "text-amber-200" : "text-zinc-400"
                        }`}
                      />
                      <input
                        value={d.pos}
                        onChange={(e) => patch(i, { pos: e.target.value })}
                        spellCheck={false}
                        className={`${CELL} w-10 shrink-0 text-[11px] text-purple-400/80`}
                      />
                      <input
                        value={d.pitch === null ? "" : String(d.pitch)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          patch(i, { pitch: v === "" ? null : Number(v) });
                        }}
                        inputMode="numeric"
                        placeholder="—"
                        className={`${CELL} w-7 shrink-0 text-[11px] tabular-nums placeholder:text-zinc-600 ${
                          d.pitch === null ? "text-zinc-600" : "text-zinc-300"
                        }`}
                      />
                      <input
                        value={d.meaning}
                        onChange={(e) => patch(i, { meaning: e.target.value })}
                        className={`${CELL} flex-1 text-zinc-400`}
                      />
                    </div>
                    {suspect && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 pb-1 text-[11px]">
                        <span className="w-28 shrink-0" />
                        <span className="text-amber-400/60">词典</span>
                        {expected.length === 0 ? (
                          <span className="text-amber-400/50">
                            没有这个读音
                          </span>
                        ) : (
                          expected.map((w) => (
                            <button
                              key={w}
                              onClick={() => patch(i, { kanji: w })}
                              style={{ fontFamily: JP }}
                              className="rounded bg-amber-400/10 px-1.5 py-0.5 text-amber-200 transition-colors hover:bg-amber-400/25"
                            >
                              {w}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-white/[0.06] px-3.5 py-2.5">
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="标签"
              className="w-28 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none"
            />
            {hasWords && (
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-500">
                <input
                  type="checkbox"
                  checked={replace}
                  onChange={(e) => setReplace(e.target.checked)}
                  className="h-3 w-3 accent-purple-500"
                />
                清空现有
              </label>
            )}
            <button
              onClick={() => {
                onImport(drafts, tag.trim(), replace);
                reset();
              }}
              className="ml-auto flex items-center gap-1.5 rounded-md bg-purple-600 px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-purple-500"
            >
              <Check className="h-3.5 w-3.5" />
              导入 {drafts.length} 个
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
