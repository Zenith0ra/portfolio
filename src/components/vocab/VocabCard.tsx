"use client";

import { Volume2 } from "lucide-react";
import { PitchKana } from "./PitchMark";
import type { CardMode, VocabWord } from "@/lib/vocab/types";

const JP_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif';

const SURFACE =
  "radial-gradient(54% 48% at 50% 44%, rgba(168,85,247,0.075) 0%, rgba(168,85,247,0) 70%), radial-gradient(150% 120% at 50% -20%, #2a2733 0%, #1e1c22 45%, #171618 100%)";

interface Props {
  word: VocabWord;
  mode: CardMode;
  revealed: boolean;
  onToggle: () => void;
  onSpeak: (text: string, rate?: number) => void;
}

function sizeFor(text: string, steps: [number, number, number]): number {
  if (text.length <= 4) return steps[0];
  if (text.length <= 7) return steps[1];
  return steps[2];
}

function Front({
  word,
  mode,
  onSpeak,
}: {
  word: VocabWord;
  mode: CardMode;
  onSpeak: Props["onSpeak"];
}) {
  if (mode === "audio") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSpeak(word.kana);
        }}
        className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-zinc-300 transition-colors hover:border-purple-400/40 hover:text-white"
      >
        <Volume2 className="h-4 w-4" />
        <span className="text-[13px]">再听一次</span>
      </button>
    );
  }

  const isJapanese = mode !== "cn";
  const text =
    mode === "cn"
      ? word.meaning
      : mode === "kanji"
        ? word.kanji || word.kana
        : word.kana;

  return (
    <div
      className={
        isJapanese
          ? "px-10 text-center font-medium leading-[1.25] tracking-wide text-white"
          : "px-10 text-center text-[clamp(30px,4.8vw,50px)] font-medium leading-snug tracking-wide text-white"
      }
      style={
        isJapanese
          ? { fontFamily: JP_FONT, fontSize: sizeFor(text, [58, 48, 38]) }
          : undefined
      }
    >
      {text}
    </div>
  );
}

function Back({ word, onSpeak }: { word: VocabWord; onSpeak: Props["onSpeak"] }) {
  const kanaSize = sizeFor(word.kana, [58, 50, 40]);
  const kanjiSize = sizeFor(word.kanji || "", [34, 30, 25]);

  return (
    <div className="flex h-full min-h-[360px] flex-col px-8 py-7 text-left">
      <div className="flex flex-wrap items-center gap-1.5">
        {word.pos && (
          <span className="rounded border border-purple-400/25 bg-purple-500/10 px-1.5 py-0.5 text-[12px] text-purple-300">
            {word.pos}
          </span>
        )}
        {word.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[12px] text-zinc-500"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6">
        {word.kanji && (
          <div
            className="leading-tight text-zinc-400"
            style={{ fontFamily: JP_FONT, fontSize: kanjiSize }}
          >
            {word.kanji}
          </div>
        )}
        <div className="mt-2 flex items-end gap-3">
          <PitchKana
            kana={word.kana}
            pitch={word.pitch}
            fontSize={kanaSize}
            fontFamily={JP_FONT}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(word.kana);
            }}
            className="mb-2 rounded p-1.5 text-zinc-600 transition-colors hover:bg-white/5 hover:text-purple-300"
            aria-label="发音"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          {word.pitch !== null && (
            <span
              className="mb-1 text-[24px] font-semibold leading-none tabular-nums text-purple-300"
              title="声调"
            >
              {word.pitch}
            </span>
          )}
        </div>
      </div>

      <div className="my-5 h-px shrink-0 bg-white/[0.07]" />

      <div className="min-h-0 flex-1">
        <div className="text-[22px] leading-relaxed text-zinc-100">
          {word.meaning}
        </div>

        {word.examples.length > 0 && (
          <div className="mt-3.5 space-y-2.5">
            {word.examples.map((ex, i) => (
              <div key={i} className="border-l border-purple-400/20 pl-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(ex.jp, 0.85);
                  }}
                  className="block text-left text-[17px] leading-relaxed text-zinc-300 transition-colors hover:text-white"
                  style={{ fontFamily: JP_FONT }}
                >
                  {ex.jp}
                </button>
                {ex.cn && (
                  <div className="mt-1 text-[14.5px] leading-relaxed text-zinc-500">
                    {ex.cn}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {word.note && (
          <div className="mt-3 rounded bg-white/[0.03] px-2.5 py-2 text-[13.5px] leading-relaxed text-zinc-500">
            {word.note}
          </div>
        )}
      </div>
    </div>
  );
}

export function VocabCard({ word, mode, revealed, onToggle, onSpeak }: Props) {
  const faceClass =
    "col-start-1 row-start-1 overflow-hidden rounded-2xl border border-white/[0.09]";

  return (
    <div className="[perspective:1800px]">
      <div
        onClick={onToggle}
        className="grid cursor-pointer select-none transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className={`${faceClass} relative flex min-h-[360px] flex-col items-center justify-center`}
          style={{ backfaceVisibility: "hidden", background: SURFACE }}
        >
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/45 to-transparent" />
          {word.tags.length > 0 && (
            <div className="absolute inset-x-0 top-7 text-center text-[11.5px] tracking-[0.2em] text-zinc-600">
              {word.tags.join(" · ")}
            </div>
          )}
          <div className="flex flex-col items-center">
            <Front word={word} mode={mode} onSpeak={onSpeak} />
            <div className="mt-7 h-px w-9 bg-purple-400/25" />
          </div>
        </div>

        <div
          className={`${faceClass} relative`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: SURFACE,
          }}
        >
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/45 to-transparent" />
          <Back word={word} onSpeak={onSpeak} />
        </div>
      </div>
    </div>
  );
}
