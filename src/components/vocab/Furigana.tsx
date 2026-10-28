"use client";

import { parseAnnotated } from "@/lib/vocab/ruby";

interface Props {
  /** Plain sentence, used when there is no annotation. */
  text: string;
  /** Same sentence with 漢字[かんじ] annotations. */
  ruby?: string;
  /** Size of the sentence itself; the reading scales off it. */
  size?: number;
  className?: string;
}

/**
 * A Japanese sentence with kana over the kanji. Falls back to plain text when
 * the sentence carries no reading, so old cards keep rendering as before.
 *
 * The reading is positioned rather than wrapped in <ruby>: a ruby box is as
 * wide as its annotation, which pushes the kanji apart (教会 きょうかい) and
 * makes words look spaced out mid-sentence.
 */
export function Furigana({ text, ruby, size = 17, className = "" }: Props) {
  const source = ruby?.trim() ? ruby : text;
  const pieces = parseAnnotated(source);
  const rtSize = Math.min(11, Math.max(9, Math.round(size * 0.62)));

  return (
    <span className={className}>
      {pieces.map((p, i) =>
        p.reading ? (
          <span
            key={i}
            className="relative inline-block whitespace-nowrap"
            style={{ lineHeight: 1 }}
          >
            {p.base}
            <span
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{
                top: `-${rtSize + 1}px`,
                fontSize: rtSize,
                lineHeight: 1.1,
                letterSpacing: 0,
                fontWeight: 400,
                color: "#8f8f99",
              }}
            >
              {p.reading}
            </span>
          </span>
        ) : (
          <span key={i}>{p.base}</span>
        )
      )}
    </span>
  );
}
