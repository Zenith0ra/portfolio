"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";

export default function UuidPage() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () => {
    const safeCount = Math.max(1, Math.min(20, count || 1));
    const list: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      list.push(crypto.randomUUID());
    }
    setUuids(list);
    setCopied(null);
  };

  const copyToClipboard = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 1500);
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

        <h1 className="text-2xl font-bold text-white">UUID Generator</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate random UUIDs (v4) using the Web Crypto API.
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-400">Count</label>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-24 rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-sm text-zinc-300 focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              onClick={generate}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              Generate
            </button>
          </div>

          {uuids.length > 0 && (
            <div className="space-y-2">
              {uuids.map((uuid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/80 p-3"
                >
                  <span className="font-mono text-sm text-zinc-300 break-all">
                    {uuid}
                  </span>
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="ml-3 flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
                  >
                    {copied === uuid ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
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
