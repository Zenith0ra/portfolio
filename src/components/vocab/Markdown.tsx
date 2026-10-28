"use client";

import type { ReactNode } from "react";

/**
 * Small markdown renderer for chat replies: bold / italic / inline code /
 * links / headings / lists / quotes / fenced code. Deliberately not a full
 * parser — it builds React nodes so model output can never inject HTML.
 */

const INLINE =
  /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function inlineNodes(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((m = INLINE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `i${m.index}`;

    if (tok.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-zinc-100">
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[13px] text-zinc-200"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      nodes.push(
        link ? (
          <a
            key={key}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
            className="text-purple-300 underline underline-offset-2 hover:text-purple-200"
          >
            {link[1]}
          </a>
        ) : (
          tok
        )
      );
    } else {
      nodes.push(
        <em key={key} className="text-zinc-400">
          {tok.slice(1, -1)}
        </em>
      );
    }
    last = m.index + tok.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** A half-streamed `**bold` should read as bold, not as literal stars. */
function closeOpenBold(src: string): string {
  const stars = src.match(/\*\*/g);
  if (stars && stars.length % 2 === 1) {
    const i = src.lastIndexOf("**");
    return src.slice(0, i) + src.slice(i + 2);
  }
  return src;
}

const HEAD = [
  "text-[16px] font-semibold text-zinc-100",
  "text-[15px] font-semibold text-zinc-100",
  "text-[14.5px] font-semibold text-zinc-200",
  "text-[14.5px] font-medium text-zinc-200",
];

export function Markdown({ text }: { text: string }) {
  const lines = closeOpenBold(text).replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let code: string[] | null = null;
  let blank = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (/^```/.test(line.trim())) {
      if (code) {
        out.push(
          <pre
            key={`c${i}`}
            className="overflow-x-auto rounded-md bg-black/40 p-2.5 font-mono text-[12.5px] leading-[1.6] text-zinc-300"
          >
            <code>{code.join("\n")}</code>
          </pre>
        );
        code = null;
      } else {
        code = [];
      }
      blank = false;
      continue;
    }
    if (code) {
      code.push(raw);
      continue;
    }

    if (!line.trim()) {
      if (!blank && out.length) out.push(<div key={`b${i}`} className="h-1.5" />);
      blank = true;
      continue;
    }
    blank = false;

    const head = /^(#{1,4})\s+(.*)$/.exec(line);
    if (head) {
      out.push(
        <div key={`h${i}`} className={`${HEAD[head[1].length - 1]} mt-0.5`}>
          {inlineNodes(head[2])}
        </div>
      );
      continue;
    }

    if (/^([-*_])\1{2,}$/.test(line.trim())) {
      out.push(<div key={`r${i}`} className="my-0.5 h-px bg-white/10" />);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      out.push(
        <div key={`q${i}`} className="border-l-2 border-purple-500/40 pl-2.5 text-zinc-400">
          {inlineNodes(quote[1])}
        </div>
      );
      continue;
    }

    const item = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(raw);
    if (item) {
      out.push(
        <div key={`l${i}`} className="flex gap-2">
          <span className="shrink-0 select-none text-zinc-600">
            {/^\d/.test(item[1]) ? item[1] : "•"}
          </span>
          <span className="min-w-0 flex-1">{inlineNodes(item[2])}</span>
        </div>
      );
      continue;
    }

    out.push(
      <div key={`p${i}`} className="min-w-0 [overflow-wrap:anywhere]">
        {inlineNodes(line)}
      </div>
    );
  }

  if (code) {
    out.push(
      <pre
        key="tail"
        className="overflow-x-auto rounded-md bg-black/40 p-2.5 font-mono text-[12.5px] leading-[1.6] text-zinc-300"
      >
        <code>{code.join("\n")}</code>
      </pre>
    );
  }

  return (
    <div className="flex flex-col gap-[3px] text-[14.5px] leading-[1.75] text-zinc-300">
      {out}
    </div>
  );
}
