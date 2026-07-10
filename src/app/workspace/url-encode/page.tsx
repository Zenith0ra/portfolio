"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";

export default function UrlEncodePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const encode = () => {
    setError("");
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    setError("");
    if (!input) {
      setOutput("");
      return;
    }
    try {
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setError("Invalid URL-encoded input. Please check your text.");
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

        <h1 className="text-2xl font-bold text-white">URL Encode / Decode</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Encode text to URL-safe format or decode it back.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL-encoded string..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={encode}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              Encode
            </button>
            <button
              onClick={decode}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              Decode
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-400">
                Output
              </label>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </footer>
      </main>
    </div>
  );
}
