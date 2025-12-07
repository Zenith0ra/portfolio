"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  FileJson,
  Palette,
  Clock,
  QrCode,
  Hash,
  GitBranch,
  Search,
} from "lucide-react";
import Link from "next/link";
import { GlowingOrb } from "@/components/GlowingOrb";
import { BentoCard } from "@/components/BentoCard";
import { LucideIcon } from "lucide-react";

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "cyan" | "purple" | "orange";
  keywords: string[];
}

const tools: Tool[] = [
  {
    title: "Diagram",
    description: "Flowcharts & sequence diagrams",
    icon: GitBranch,
    href: "/workspace/diagram",
    color: "purple",
    keywords: ["mermaid", "flowchart", "sequence", "graph", "uml", "图表", "流程图"],
  },
  {
    title: "JSON",
    description: "Format & validate JSON",
    icon: FileJson,
    href: "/workspace/json-formatter",
    color: "cyan",
    keywords: ["json", "format", "minify", "validate", "格式化"],
  },
  {
    title: "Color",
    description: "HEX, RGB, HSL converter",
    icon: Palette,
    href: "/workspace/color-converter",
    color: "purple",
    keywords: ["color", "hex", "rgb", "hsl", "颜色", "转换"],
  },
  {
    title: "Pomodoro",
    description: "Focus timer",
    icon: Clock,
    href: "/workspace/pomodoro",
    color: "orange",
    keywords: ["timer", "pomodoro", "focus", "番茄钟", "计时"],
  },
  {
    title: "QR Code",
    description: "Generate QR codes",
    icon: QrCode,
    href: "/workspace/qr-generator",
    color: "cyan",
    keywords: ["qr", "qrcode", "二维码", "generate"],
  },
  {
    title: "Hash",
    description: "MD5, SHA-1, SHA-256",
    icon: Hash,
    href: "/workspace/hash-generator",
    color: "purple",
    keywords: ["hash", "md5", "sha", "sha256", "encrypt", "哈希", "加密"],
  },
];

export default function WorkspacePage() {
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools;
    const query = search.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [search]);

  return (
    <div className="relative min-h-screen overflow-hidden noise-overlay">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern" />
      <GlowingOrb
        color="rgba(255, 107, 53, 0.15)"
        size={500}
        top="10%"
        right="-100px"
        delay={0.2}
      />
      <GlowingOrb
        color="rgba(168, 85, 247, 0.1)"
        size={400}
        bottom="20%"
        left="-100px"
        delay={0.4}
      />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-3">
                <Boxes className="h-7 w-7 text-orange-400" />
              </div>
              <div>
                <h1 className="gradient-text text-3xl font-bold tracking-tight">
                  Workspace
                </h1>
                <p className="text-sm text-zinc-500">Developer tools in browser</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Tools Grid - 3 columns */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            >
              <BentoCard
                glowColor={tool.color}
                delay={0}
                href={tool.href}
                className="group h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-lg p-2 ${
                      tool.color === "cyan" 
                        ? "bg-cyan-500/10" 
                        : tool.color === "purple" 
                        ? "bg-purple-500/10" 
                        : "bg-orange-500/10"
                    }`}>
                      <tool.icon className={`h-4 w-4 ${
                        tool.color === "cyan" 
                          ? "text-cyan-400" 
                          : tool.color === "purple" 
                          ? "text-purple-400" 
                          : "text-orange-400"
                      }`} />
                    </div>
                    <ArrowUpRight className={`h-3.5 w-3.5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      tool.color === "cyan" 
                        ? "group-hover:text-cyan-400" 
                        : tool.color === "purple" 
                        ? "group-hover:text-purple-400" 
                        : "group-hover:text-orange-400"
                    }`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-1">{tool.description}</p>
                </div>
              </BentoCard>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-zinc-500">No tools found for &quot;{search}&quot;</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
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
