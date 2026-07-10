"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegexPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [text, setText] = useState("");

  const { error, matches, highlighted } = useMemo(() => {
    if (!pattern) return { error: "", matches: 0, highlighted: [] as React.ReactNode[] };
    try {
      const flagStr =
        (flags.g ? "g" : "") + (flags.i ? "i" : "") + (flags.m ? "m" : "");
      const re = new RegExp(pattern, flagStr);
      const found = text.match(re);
      const count = found ? (flags.g ? found.length : 1) : 0;

      // Build highlighted output
      const nodes: React.ReactNode[] = [];
      if (count > 0) {
        // Use matchAll with global flag for highlighting; fall back to exec
        if (flags.g) {
          const globalRe = new RegExp(pattern, flagStr);
          let lastIndex = 0;
          let m: RegExpExecArray | null;
          let key = 0;
          while ((m = globalRe.exec(text)) !== null) {
            if (m.index > lastIndex) {
              nodes.push(
                <span key={key++}>{text.slice(lastIndex, m.index)}</span>
              );
            }
            nodes.push(
              <mark
                key={key++}
                className="rounded bg-yellow-500/20 px-0.5 text-yellow-300"
              >
                {m[0]}
              </mark>
            );
            lastIndex = m.index + m[0].length;
            if (m[0].length === 0) {
              // Avoid infinite loop on zero-width matches
              if (lastIndex < text.length) {
                nodes.push(<span key={key++}>{text[lastIndex]}</span>);
                lastIndex++;
              }
              globalRe.lastIndex = lastIndex;
            }
          }
          if (lastIndex < text.length) {
            nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
          }
        } else {
          const singleRe = new RegExp(pattern, flagStr.replace("g", ""));
          const m = singleRe.exec(text);
          if (m) {
            nodes.push(<span key={0}>{text.slice(0, m.index)}</span>);
            nodes.push(
              <mark key={1} className="rounded bg-yellow-500/20 px-0.5 text-yellow-300">
                {m[0]}
              </mark>
            );
            nodes.push(<span key={2}>{text.slice(m.index + m[0].length)}</span>);
          }
        }
      }

      return { error: "", matches: count, highlighted: nodes };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Invalid regular expression",
        matches: 0,
        highlighted: [],
      };
    }
  }, [pattern, flags, text]);

  const toggleFlag = (flag: "g" | "i" | "m") => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link
          href="/workspace"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>

        <h1 className="text-2xl font-bold text-white">Regex Tester</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Test regular expressions and highlight matches in your text.
        </p>

        <div className="mt-8 space-y-4">
          {/* Pattern + flags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Regular expression
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-zinc-900/80 px-3">
                <span className="text-zinc-500">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="enter pattern..."
                  className="w-full bg-transparent px-2 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                />
                <span className="text-zinc-500">/</span>
                <span className="ml-1 text-sm text-zinc-500">
                  {(flags.g ? "g" : "") + (flags.i ? "i" : "") + (flags.m ? "m" : "")}
                </span>
              </div>
              <div className="flex gap-2">
                {(["g", "i", "m"] as const).map((f) => (
                  <label
                    key={f}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      flags[f]
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-zinc-900/80 text-zinc-500 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={flags[f]}
                      onChange={() => toggleFlag(f)}
                      className="hidden"
                    />
                    {f}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Test text */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Test text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to test against..."
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Result */}
          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Matches:{" "}
                <span className="font-mono text-white">{matches}</span>
              </p>
              <div className="whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300">
                {text ? highlighted : <span className="text-zinc-600">Output will appear here...</span>}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </footer>
      </main>
    </div>
  );
}
