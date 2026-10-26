"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const fileRef = useRef<HTMLInputElement>(null);

  // Warm the accent dictionary while the user is still typing or picking files.
  useEffect(() => {
    loadAccent();
  }, []);

  /** Show the rows, then overwrite their pitch with dictionary values. */
  const finish = useCallback(async (list: WordDraft[]) => {
    setDrafts(list);
    setFill(null);
    const ok = await loadAccent();
    if (!ok) return;
    const res = applyPitch(list);
    setDrafts(res.drafts);
    setFill(res);
  }, []);

  const runLocal = useCallback(async () => {
    setError(null);
    const out = parseWordList(text);
    if (out.quality === "empty") {
      setError("没认出任何词条，换个格式或者用 AI 整理试试");
      setDrafts(null);
      return;
    }
    setSkipped(out.skipped);
    await finish(out.words);
  }, [text, finish]);

  const runAi = useCallback(async () => {
    if (!hasAiKey) {
      setError("这个操作要用 AI，先在右上角设置里填 API Key");
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
      setDrafts(out);
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
      setError("这个操作要用 AI，先在右上角设置里填 API Key");
      onOpenSettings();
      return;
    }
    if (!images.length) return;
    setError(null);
    setBusy("image");
    try {
      const all: WordDraft[] = [];
      for (const img of images) {
        const part = await aiStructure({ imageDataUrl: img }, cfg);
        all.push(...part);
      }
      if (!all.length) {
        setError("这张图没读出词条，换一张清楚一点的");
        return;
      }
      setDrafts(all);
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
  }, [cfg, hasAiKey, images, onOpenSettings, finish]);

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
  };

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
        <h2 className="text-[14px] font-medium text-white">导入单词表</h2>
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
          让 AI 补例句
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
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-300">认出 {drafts.length} 个词</span>
              {skipped > 0 && (
                <span className="text-zinc-600">· {skipped} 行没读懂</span>
              )}
              {fill && (
                <span className="text-zinc-600">
                  · 声调 {drafts.filter((d) => d.pitch !== null).length}/
                  {drafts.length}
                </span>
              )}
              {fill && fill.suspect > 0 && (
                <span className="text-amber-400/70">
                  · {fill.suspect} 条汉字待核对
                </span>
              )}
            </div>
            <button
              onClick={reset}
              className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
            >
              清空
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-[12px]">
              <tbody>
                {drafts.slice(0, 40).map((d, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/[0.04] last:border-0 ${
                      fill?.suspectAt.includes(i) ? "bg-amber-500/[0.07]" : ""
                    }`}
                  >
                    <td
                      className="w-28 px-3.5 py-1.5 text-zinc-200"
                      style={{
                        fontFamily:
                          '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
                      }}
                    >
                      {d.kana}
                    </td>
                    <td
                      className="w-24 px-2 py-1.5 text-zinc-500"
                      style={{
                        fontFamily:
                          '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
                      }}
                    >
                      {d.kanji}
                    </td>
                    <td className="w-12 px-2 py-1.5 text-[11px] text-purple-400/80">
                      {d.pos}
                    </td>
                    <td
                      className="w-8 px-1 py-1.5 text-[11px] tabular-nums text-zinc-500"
                      title="声调"
                    >
                      {d.pitch === null ? "—" : d.pitch}
                    </td>
                    <td className="px-2 py-1.5 text-zinc-400">{d.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {drafts.length > 40 && (
              <div className="px-3.5 py-2 text-[11px] text-zinc-600">
                还有 {drafts.length - 40} 个…
              </div>
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
