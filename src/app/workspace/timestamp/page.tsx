"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TimestampPage() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  // Update current timestamp every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timestamp -> Date
  const tsToDate = (() => {
    if (!tsInput) return "";
    const ts = Number(tsInput);
    if (Number.isNaN(ts)) return "Invalid timestamp";
    // Allow both seconds and milliseconds
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "Invalid timestamp";
    return d.toLocaleString();
  })();

  // Date -> Timestamp
  const dateToTs = (() => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return "";
    return Math.floor(d.getTime() / 1000).toString();
  })();

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

        <h1 className="text-2xl font-bold text-white">Unix Timestamp Converter</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Convert between Unix timestamps and human-readable dates.
        </p>

        {/* Current timestamp */}
        <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/80 p-6">
          <p className="text-sm text-zinc-500">Current Unix timestamp</p>
          <p className="mt-1 font-mono text-3xl font-bold text-white">{now}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(now * 1000).toLocaleString()}
          </p>
        </div>

        {/* Conversion grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Timestamp -> Date */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
            <h2 className="text-sm font-medium text-zinc-400">Timestamp → Date</h2>
            <input
              type="number"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="e.g. 1700000000"
              className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-sm text-zinc-300 focus:outline-none focus:border-white/20"
            />
            <p className="mt-3 break-words font-mono text-sm text-zinc-300">
              {tsToDate || "—"}
            </p>
          </div>

          {/* Date -> Timestamp */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
            <h2 className="text-sm font-medium text-zinc-400">Date → Timestamp</h2>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-sm text-zinc-300 focus:outline-none focus:border-white/20"
            />
            <p className="mt-3 break-words font-mono text-sm text-zinc-300">
              {dateToTs || "—"}
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </footer>
      </main>
    </div>
  );
}
