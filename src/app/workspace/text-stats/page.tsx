"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TextStatsPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    return { charsWithSpaces, charsNoSpaces, words, lines, paragraphs };
  }, [text]);

  const cards = [
    { label: "Characters", value: stats.charsWithSpaces },
    { label: "No spaces", value: stats.charsNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Paragraphs", value: stats.paragraphs },
  ];

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

        <h1 className="text-2xl font-bold text-white">Text Statistics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Real-time statistics for your text: characters, words, lines, and more.
        </p>

        <div className="mt-8 space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            rows={8}
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-center"
              >
                <p className="font-mono text-3xl font-bold text-white">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{card.label}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </footer>
      </main>
    </div>
  );
}
