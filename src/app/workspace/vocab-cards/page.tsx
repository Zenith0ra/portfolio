"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Library } from "@/components/vocab/Library";
import { ImportPanel } from "@/components/vocab/ImportPanel";
import { AiChat } from "@/components/vocab/AiChat";
import { SettingsDialog } from "@/components/vocab/SettingsDialog";
import { VocabCard } from "@/components/vocab/VocabCard";
import { loadAccent, lookupPitch } from "@/lib/vocab/accent";
import { DEFAULT_AI, aiAnnotateDrafts, type AiConfig } from "@/lib/vocab/ai";
import { wordKey } from "@/lib/vocab/parse";
import { primeVoices, speakJa } from "@/lib/vocab/speech";
import {
  loadAiConfig,
  loadWords,
  saveAiConfig,
  saveWords,
} from "@/lib/vocab/store";
import { draftToWord, type CardMode, type VocabWord, type WordDraft } from "@/lib/vocab/types";

type View = "library" | "review";

const MODES: { id: CardMode; label: string }[] = [
  { id: "cn", label: "中文" },
  { id: "kanji", label: "汉字" },
  { id: "kana", label: "假名" },
  { id: "audio", label: "听音" },
];

export default function VocabCardsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [cfg, setCfg] = useState<AiConfig>(DEFAULT_AI);
  const [view, setView] = useState<View>("library");
  const [importing, setImporting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<CardMode>("cn");

  const [cursor, setCursor] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const loaded = loadWords();
    setWords(loaded);
    setCfg(loadAiConfig());
    setImporting(loaded.length === 0);
    primeVoices();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveWords(words);
  }, [words, hydrated]);

  // Words added before the dictionary shipped have no pitch: fill them once.
  const backfilled = useRef(false);
  useEffect(() => {
    if (!hydrated || backfilled.current) return;
    if (!words.some((w) => w.pitch === null)) return;
    backfilled.current = true;
    let alive = true;
    loadAccent().then((ok) => {
      if (!ok || !alive) return;
      setWords((prev) => {
        let changed = false;
        const next = prev.map((w) => {
          if (w.pitch !== null) return w;
          const hit = lookupPitch(w.kana, w.kanji);
          if (!hit) return w;
          changed = true;
          return { ...w, pitch: hit.pitch };
        });
        return changed ? next : prev;
      });
    });
    return () => {
      alive = false;
    };
  }, [hydrated, words]);

  // Sentences stored before readings existed get them once, quietly.
  const rubyFilled = useRef(false);
  useEffect(() => {
    if (!hydrated || rubyFilled.current) return;
    if (!cfg.key.trim()) return;
    if (!words.some((w) => w.examples.some((e) => !e.ruby))) return;
    rubyFilled.current = true;
    let alive = true;
    aiAnnotateDrafts(words, cfg)
      .then((next) => {
        if (alive) setWords(next);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hydrated, cfg, words]);

  const total = words.length;
  const current = useMemo(() => words[cursor] ?? null, [words, cursor]);
  const finished = total > 0 && cursor >= total;

  const handleSpeak = useCallback((text: string, rate = 0.9) => {
    speakJa(text, rate);
  }, []);

  const handleImport = useCallback(
    (drafts: WordDraft[], tag: string, replace: boolean) => {
      const added = drafts.map((d) => draftToWord(d, tag ? [tag] : []));
      setWords((prev) => {
        if (replace) return added;
        const seen = new Set(prev.map(wordKey));
        return [...prev, ...added.filter((d) => {
          const key = wordKey(d);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })];
      });
      setImporting(false);
      setCursor(0);
      setRevealed(false);
    },
    []
  );

  const removeWords = useCallback(
    (ids: string[]) => {
      const drop = new Set(ids);
      const next = words.filter((w) => !drop.has(w.id));
      setWords(next);
      setCursor(0);
      setRevealed(false);
      // Deleting the last word means the next move is an import.
      if (next.length === 0) setImporting(true);
    },
    [words]
  );

  const startReview = useCallback(() => {
    setCursor(0);
    setRevealed(false);
    setView("review");
  }, []);

  /** Switching back to the review tab keeps whatever progress is left. */
  const resumeReview = useCallback(() => {
    setView("review");
  }, []);

  const advance = useCallback(() => {
    setCursor((c) => c + 1);
    setRevealed(false);
  }, []);

  useEffect(() => {
    if (view !== "review") return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // The chat panel has its own buttons; a stray space there must not flip
      // the card underneath it.
      if (el?.closest?.("[data-chat]")) return;
      if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowRight") {
        e.preventDefault();
        if (revealed) advance();
        else setRevealed(true);
      } else if (e.key === "Escape") {
        setView("library");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, revealed, advance]);

  // Audio mode asks the question out loud as soon as a new card appears.
  useEffect(() => {
    if (view !== "review" || mode !== "audio" || !current) return;
    if (revealed) return;
    speakJa(current.kana);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, mode, view]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(words, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocab-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 xl:max-w-5xl">
        <Link
          href="/workspace"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Vocab Cards</h1>

          <div className="flex items-center gap-1.5">
            {words.length > 0 && (
              <>
                <button
                  onClick={() => setImporting((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[13px] text-zinc-300 transition-colors hover:border-purple-400/40 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  导入
                </button>
                <button
                  onClick={exportJson}
                  className="rounded-md border border-white/10 p-1.5 text-zinc-500 transition-colors hover:border-white/20 hover:text-white"
                  title="导出 JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-md border border-white/10 p-1.5 text-zinc-500 transition-colors hover:border-white/20 hover:text-white"
              title="AI 设置"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          {importing && (
            <ImportPanel
              cfg={cfg}
              hasAiKey={!!cfg.key.trim()}
              hasWords={words.length > 0}
              onOpenSettings={() => setSettingsOpen(true)}
              onImport={handleImport}
              onCancel={words.length > 0 ? () => setImporting(false) : undefined}
            />
          )}

          {words.length === 0 && !importing && (
            <div className="rounded-xl border border-dashed border-white/10 px-6 py-16 text-center">
              <p className="text-[14px] text-zinc-500">还没有单词</p>
              <button
                onClick={() => setImporting(true)}
                className="mt-4 rounded-md bg-purple-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-purple-500"
              >
                导入
              </button>
            </div>
          )}

          {words.length > 0 && !importing && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-white/10 p-0.5">
                  <button
                    onClick={() => setView("library")}
                    className={`rounded-md px-3 py-1 text-[13px] transition-colors ${
                      view === "library"
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    词库 {total}
                  </button>
                  <button
                    onClick={resumeReview}
                    className={`rounded-md px-3 py-1 text-[13px] transition-colors ${
                      view === "review"
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    背诵
                  </button>
                </div>

                {view === "library" && (
                  <button
                    onClick={startReview}
                    className="ml-auto flex items-center gap-1.5 rounded-md bg-purple-600 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-purple-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    开始背诵
                  </button>
                )}
              </div>

              {view === "library" ? (
                <Library
                  words={words}
                  onSpeak={handleSpeak}
                  onUpdate={(next) =>
                    setWords((prev) =>
                      prev.map((w) => (w.id === next.id ? next : w))
                    )
                  }
                  onDelete={(id) => removeWords([id])}
                  onDeleteMany={removeWords}
                />
              ) : (
                <div>
                  <div className="flex">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex rounded-lg border border-white/10 p-0.5">
                          {MODES.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setMode(m.id)}
                              className={`rounded-md px-2.5 py-1 text-[13px] transition-colors ${
                                mode === m.id
                                  ? "bg-white/[0.08] text-white"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <span className="ml-auto text-[12px] tabular-nums text-zinc-600">
                          {finished
                            ? "完成"
                            : `${Math.min(cursor + 1, total)} / ${total}`}
                        </span>
                      </div>

                      <div className="mb-3 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-purple-500/70 transition-[width] duration-300"
                          style={{
                            width: `${Math.min(100, (cursor / Math.max(1, total)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="hidden lg:block lg:w-[356px] lg:shrink-0" />
                  </div>

                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
                    <div className="flex min-h-[360px] flex-col lg:min-h-[440px]">
                      {finished || !current ? (
                        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1e1e1e] px-6 py-14 text-center">
                          <Check className="h-6 w-6 text-emerald-400" />
                          <div className="mt-5 flex justify-center gap-2">
                            <button
                              onClick={startReview}
                              className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-purple-500"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              再来一遍
                            </button>
                            <button
                              onClick={() => setView("library")}
                              className="rounded-md border border-white/10 px-3.5 py-1.5 text-[13px] text-zinc-400 transition-colors hover:text-white"
                            >
                              回词库
                            </button>
                          </div>
                        </div>
                      ) : (
                        <VocabCard
                          word={current}
                          mode={mode}
                          revealed={revealed}
                          onToggle={() => setRevealed((v) => !v)}
                          onSpeak={handleSpeak}
                          action={
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (revealed) advance();
                                else setRevealed(true);
                              }}
                              className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[12.5px] text-zinc-400 transition-colors hover:border-purple-400/40 hover:bg-white/[0.1] hover:text-white"
                            >
                              {revealed ? "下一张" : "揭晓"}
                            </button>
                          }
                        />
                      )}
                    </div>

                    <div className="lg:flex">
                      <AiChat
                        word={current}
                        cfg={cfg}
                        onOpenSettings={() => setSettingsOpen(true)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SettingsDialog
        open={settingsOpen}
        cfg={cfg}
        onSave={(next) => {
          setCfg(next);
          saveAiConfig(next);
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
