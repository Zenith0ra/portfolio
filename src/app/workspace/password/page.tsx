"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};
const SIMILAR = /[il1Lo0O]/g;

export default function PasswordPage() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    digits: true,
    symbols: false,
  });
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const charPool = useMemo(() => {
    let pool = "";
    if (options.upper) pool += CHARSETS.upper;
    if (options.lower) pool += CHARSETS.lower;
    if (options.digits) pool += CHARSETS.digits;
    if (options.symbols) pool += CHARSETS.symbols;
    if (excludeSimilar) pool = pool.replace(SIMILAR, "");
    return pool;
  }, [options, excludeSimilar]);

  const canGenerate = charPool.length > 0;

  // Strength: based on length and number of selected character types
  const strength = useMemo(() => {
    const types =
      Number(options.upper) +
      Number(options.lower) +
      Number(options.digits) +
      Number(options.symbols);
    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (types >= 2) score++;
    if (types >= 3) score++;
    if (types >= 4) score++;
    if (score <= 2) return { label: "Weak", color: "text-red-400", bar: "bg-red-400", pct: 33 };
    if (score <= 4) return { label: "Medium", color: "text-yellow-400", bar: "bg-yellow-400", pct: 66 };
    return { label: "Strong", color: "text-green-400", bar: "bg-green-400", pct: 100 };
  }, [length, options]);

  const generate = useCallback(() => {
    if (!canGenerate) return;
    const pool = charPool;
    const result: string[] = [];
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      result.push(pool[arr[i] % pool.length]);
    }
    setPassword(result.join(""));
    setCopied(false);
  }, [canGenerate, charPool, length]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
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

        <h1 className="text-2xl font-bold text-white">Password Generator</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate secure random passwords using the Web Crypto API.
        </p>

        <div className="mt-8 space-y-6">
          {/* Password display */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="break-all font-mono text-xl text-white">
                {password || <span className="text-zinc-600">Click generate...</span>}
              </p>
              <button
                onClick={copyToClipboard}
                disabled={!password}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {/* Strength indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Strength</span>
                <span className={`text-xs font-medium ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${strength.bar}`}
                  style={{ width: `${strength.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Length slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400">Length</label>
              <span className="font-mono text-sm text-white">{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          {/* Character options */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "upper", label: "Uppercase (A-Z)" },
              { key: "lower", label: "Lowercase (a-z)" },
              { key: "digits", label: "Digits (0-9)" },
              { key: "symbols", label: "Symbols (!@#$...)" },
            ] as const).map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  options[opt.key]
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-zinc-900/80 text-zinc-500 hover:text-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={options[opt.key]}
                  onChange={() => toggleOption(opt.key)}
                  className="accent-white"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Exclude similar */}
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
              excludeSimilar
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-zinc-900/80 text-zinc-500 hover:text-white"
            }`}
          >
            <input
              type="checkbox"
              checked={excludeSimilar}
              onChange={() => setExcludeSimilar((v) => !v)}
              className="accent-white"
            />
            Exclude similar characters (i, l, 1, L, o, 0, O)
          </label>

          {/* Generate */}
          <button
            onClick={generate}
            disabled={!canGenerate}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate Password
          </button>
          {!canGenerate && (
            <p className="-mt-3 text-xs text-red-400">
              Select at least one character type.
            </p>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </footer>
      </main>
    </div>
  );
}
