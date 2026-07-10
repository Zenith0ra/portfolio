"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  FileJson,
  Minimize2,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input, indentSize]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const clearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const loadSample = useCallback(() => {
    const sample = {
      name: "Linzhi Hou",
      university: "Tsinghua University",
      major: "Computer Science",
      year: 3,
      skills: ["C++", "Python", "TypeScript", "React"],
      contact: {
        email: "hlz23@mails.tsinghua.edu.cn",
        github: "Zenith0ra",
      },
    };
    setInput(JSON.stringify(sample));
    formatJson();
  }, [formatJson]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/workspace"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-3">
              <FileJson className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">
                JSON Formatter
              </h1>
              <p className="text-zinc-500">Format, validate, and minify JSON data</p>
            </div>
          </div>
        </motion.div>

        {/* Tool Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={formatJson}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/30"
          >
            <Maximize2 className="h-4 w-4" />
            Format
          </button>
          <button
            onClick={minifyJson}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/30"
          >
            <Minimize2 className="h-4 w-4" />
            Minify
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/10"
          >
            Load Sample
          </button>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-500">Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 border border-white/10 focus:outline-none focus:border-cyan-500/50"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Editor Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {/* Input */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-zinc-400">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  formatJson();
                }
              }}
              placeholder='Paste your JSON here... (Ctrl/Cmd + Enter to format)'
              className="h-[500px] w-full resize-none rounded-xl bg-white/5 border border-white/10 p-4 font-mono text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-zinc-400">Output</label>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="h-[500px] w-full resize-none rounded-xl bg-white/5 border border-white/10 p-4 font-mono text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
              spellCheck={false}
            />
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl bg-white/5 border border-white/10 p-4"
        >
          <h3 className="mb-2 text-sm font-medium text-zinc-400">Tips</h3>
          <ul className="space-y-1 text-xs text-zinc-500">
            <li>• Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">Ctrl/Cmd + Enter</kbd> to quickly format</li>
            <li>• Use &quot;Minify&quot; to compress JSON for storage or transmission</li>
            <li>• Invalid JSON will show an error message with details</li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Linzhi Hou
          </p>
        </motion.footer>
      </main>
    </div>
  );
}


