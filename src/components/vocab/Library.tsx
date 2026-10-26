"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Search, Trash2, Volume2, X } from "lucide-react";
import type { VocabWord } from "@/lib/vocab/types";

const JP =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif';

interface Props {
  words: VocabWord[];
  onUpdate: (word: VocabWord) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
  onSpeak: (text: string) => void;
}

function Editor({
  word,
  onSave,
  onCancel,
}: {
  word: VocabWord;
  onSave: (w: VocabWord) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(word);
  const [exampleText, setExampleText] = useState(
    word.examples.map((e) => `${e.jp} | ${e.cn}`).join("\n")
  );

  const field = (label: string, key: keyof VocabWord, placeholder = "") => (
    <label className="flex items-center gap-2">
      <span className="w-11 shrink-0 text-[11px] text-zinc-600">{label}</span>
      <input
        value={String(draft[key] ?? "")}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-zinc-200 placeholder:text-zinc-700 focus:border-purple-500/50 focus:outline-none"
      />
    </label>
  );

  return (
    <div className="space-y-2 border-t border-white/[0.06] bg-black/25 px-4 py-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {field("假名", "kana")}
        {field("汉字", "kanji")}
        {field("释义", "meaning")}
        {field("词性", "pos", "名 / 动1 / 形1")}
        <label className="flex items-center gap-2">
          <span className="w-11 shrink-0 text-[11px] text-zinc-600">声调</span>
          <input
            type="number"
            min={0}
            max={12}
            value={draft.pitch ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                pitch: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="min-w-0 flex-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-zinc-200 focus:border-purple-500/50 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex items-start gap-2">
        <span className="mt-1 w-11 shrink-0 text-[11px] text-zinc-600">例句</span>
        <textarea
          value={exampleText}
          onChange={(e) => setExampleText(e.target.value)}
          placeholder={"日语句子 | 中文"}
          className="h-16 min-w-0 flex-1 resize-y rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] leading-relaxed text-zinc-200 placeholder:text-zinc-700 focus:border-purple-500/50 focus:outline-none"
          style={{ fontFamily: JP }}
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="rounded px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:text-white"
        >
          取消
        </button>
        <button
          onClick={() => {
            const examples = exampleText
              .split("\n")
              .map((line) => {
                const [jp, cn] = line.split("|");
                return { jp: (jp ?? "").trim(), cn: (cn ?? "").trim() };
              })
              .filter((e) => e.jp);
            onSave({ ...draft, examples });
          }}
          className="rounded bg-purple-600 px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-purple-500"
        >
          保存
        </button>
      </div>
    </div>
  );
}

export function Library({
  words,
  onUpdate,
  onDelete,
  onDeleteMany,
  onSpeak,
}: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [armed, setArmed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.kana.includes(q) ||
        w.kanji.includes(q) ||
        w.meaning.toLowerCase().includes(q)
    );
  }, [words, query]);

  // Leave select mode whenever the visible set empties out from under it.
  useEffect(() => {
    if (!selecting) return;
    setPicked((prev) => {
      const alive = new Set(words.map((w) => w.id));
      const next = new Set([...prev].filter((id) => alive.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [words, selecting]);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2600);
    return () => clearTimeout(t);
  }, [armed]);

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allPicked =
    filtered.length > 0 && filtered.every((w) => picked.has(w.id));

  function exitSelect() {
    setSelecting(false);
    setPicked(new Set());
    setArmed(false);
  }

  function commitDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    onDeleteMany([...picked]);
    exitSelect();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e]">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.07] px-3.5 py-2.5">
        {selecting ? (
          <>
            <button
              onClick={() =>
                setPicked(
                  allPicked ? new Set() : new Set(filtered.map((w) => w.id))
                )
              }
              className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[12px] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <Check className="h-3 w-3" />
              {allPicked ? "取消全选" : "全选"}
            </button>
            <button
              onClick={exitSelect}
              className="rounded-md px-2.5 py-1 text-[12px] text-zinc-500 transition-colors hover:text-white"
            >
              退出
            </button>
            <span className="mx-1 text-[11.5px] tabular-nums text-zinc-600">
              已选 {picked.size}
            </span>
            <button
              onClick={commitDelete}
              disabled={picked.size === 0}
              className={`ml-auto flex items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-colors disabled:opacity-35 ${
                armed
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {armed ? `确认删除 ${picked.size}` : `删除 ${picked.size}`}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelecting(true)}
              className="rounded-md border border-white/10 px-2.5 py-1 text-[12px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
            >
              批量删除
            </button>
            <span className="mx-1 text-[11.5px] tabular-nums text-zinc-600">
              {words.length} 词
            </span>
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索"
                className="w-36 rounded-md border border-white/10 bg-white/[0.04] py-1 pl-7 pr-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="max-h-[calc(100dvh-320px)] min-h-[220px] overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-white/[0.05] px-3.5 py-1.5 text-[10.5px] text-zinc-700">
          {selecting && <span className="w-4 shrink-0" />}
          <span className="w-28 shrink-0">假名</span>
          <span className="hidden w-24 shrink-0 sm:block">汉字</span>
          <span className="hidden w-11 shrink-0 sm:block">词性</span>
          <span className="w-8 shrink-0">调</span>
          <span className="min-w-0 flex-1">释义</span>
          <span className="w-[62px] shrink-0" />
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center text-[12px] text-zinc-600">
            没有匹配的词
          </div>
        ) : (
          filtered.map((w) => {
            const on = picked.has(w.id);
            return (
              <div key={w.id} className="border-b border-white/[0.04] last:border-0">
                <div
                  onClick={
                    selecting
                      ? () => togglePick(w.id)
                      : undefined
                  }
                  className={`group flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                    selecting
                      ? `cursor-pointer ${on ? "bg-purple-500/[0.08]" : "hover:bg-white/[0.025]"}`
                      : "hover:bg-white/[0.025]"
                  }`}
                >
                  {selecting && (
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        on
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-white/20"
                      }`}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                  )}
                  <span
                    className="w-28 shrink-0 truncate text-[15px] text-zinc-100"
                    style={{ fontFamily: JP }}
                  >
                    {w.kana}
                  </span>
                  <span
                    className="hidden w-24 shrink-0 truncate text-[13px] text-zinc-500 sm:block"
                    style={{ fontFamily: JP }}
                  >
                    {w.kanji}
                  </span>
                  <span className="hidden w-11 shrink-0 text-[11px] text-purple-400/70 sm:block">
                    {w.pos}
                  </span>
                  <span className="w-8 shrink-0 text-[12px] tabular-nums text-zinc-500">
                    {w.pitch ?? "—"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-400">
                    {w.meaning}
                  </span>
                  {!selecting && (
                    <>
                      <button
                        onClick={() => onSpeak(w.kana)}
                        className="rounded p-1 text-zinc-700 transition-colors hover:text-purple-300"
                        aria-label="发音"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditing(editing === w.id ? null : w.id)}
                        className="rounded p-1 text-zinc-700 transition-colors hover:text-white"
                        aria-label="编辑"
                      >
                        {editing === w.id ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          <Pencil className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(w.id)}
                        className="rounded p-1 text-zinc-700 transition-colors hover:text-red-400"
                        aria-label="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
                {editing === w.id && (
                  <Editor
                    word={w}
                    onCancel={() => setEditing(null)}
                    onSave={(next) => {
                      onUpdate(next);
                      setEditing(null);
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
