"use client";

import { pitchHeights, splitMora } from "@/lib/vocab/pitch";

interface Props {
  kana: string;
  pitch: number | null;
  fontSize: number;
  fontFamily: string;
  /** show the trailing particle slot (default true) */
  particle?: boolean;
}

const CONTOUR_H = 15;
const HIGH_Y = 3.5;
const LOW_Y = 11.5;

/**
 * Kana with the pitch contour drawn directly above it.
 *
 * Every mora gets a box as wide as the characters it holds, so the dots land
 * on the centre of each kana instead of on a fixed pixel grid. Small kana
 * (きゃ, しょ) stay one mora but keep their two-character width.
 *
 * The hollow dot after the word is the following particle — the only way to
 * see at a glance why 平板 (0) and 尾高 (n) differ.
 */
export function PitchKana({
  kana,
  pitch,
  fontSize,
  fontFamily,
  particle = true,
}: Props) {
  const mora = splitMora(kana);
  if (mora.length === 0) return null;

  const heights = pitchHeights(mora.length, pitch);
  const contour = heights.length > 0;
  const slot = particle ? fontSize : 0;

  const widths = mora.map((m) => fontSize * m.length);
  const centers: number[] = [];
  let acc = 0;
  for (const w of widths) {
    // The dot sits over the first kana of the mora, so きょ reads as one beat.
    centers.push(acc + fontSize / 2);
    acc += w;
  }
  const width = acc + slot;

  const dotY = (i: number) => (heights[i] ? HIGH_Y : LOW_Y);
  const d = heights
    .map((_, i) => `${i === 0 ? "M" : "L"}${centers[i]} ${dotY(i)}`)
    .join(" ");

  const lastX = centers[centers.length - 1];
  const lastY = dotY(centers.length - 1);
  const px = acc + fontSize / 2;
  const py = pitch === 0 ? HIGH_Y : LOW_Y;

  return (
    <div className="relative shrink-0" style={{ width, fontFamily }}>
      {contour && (
        <svg
          width={width}
          height={CONTOUR_H}
          viewBox={`0 0 ${width} ${CONTOUR_H}`}
          aria-label={`声调 ${pitch}`}
          role="img"
          className="absolute left-0 top-0 overflow-visible"
        >
          <path
            d={d}
            fill="none"
            stroke="#a855f7"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {centers.map((x, i) => (
            <circle key={i} cx={x} cy={dotY(i)} r={2.3} fill="#a855f7" />
          ))}
          {particle && (
            <>
              <line
                x1={lastX + 4}
                y1={lastY}
                x2={px - 4.5}
                y2={py}
                stroke="#a855f7"
                strokeWidth={0.9}
                strokeDasharray="2 2.6"
                opacity={0.45}
              />
              <circle
                cx={px}
                cy={py}
                r={2.4}
                fill="none"
                stroke="#a855f7"
                strokeWidth={1.2}
                opacity={0.5}
              />
            </>
          )}
        </svg>
      )}

      <div
        className="flex font-medium leading-[1.12] text-white"
        style={{ paddingTop: contour ? CONTOUR_H + 5 : 0 }}
      >
        {mora.map((m, i) => (
          <span
            key={i}
            className="block text-center"
            style={{
              width: widths[i],
              flex: "0 0 auto",
              fontSize,
              whiteSpace: "nowrap",
              letterSpacing: 0,
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
