"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Boxes,
  Crosshair,
  FileJson,
  Palette,
  Clock,
  QrCode,
  Hash,
  GitBranch,
} from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { LucideIcon } from "lucide-react";

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "cyan" | "purple" | "orange";
  tags: string[];
}

const categories: { label: string; tools: Tool[] }[] = [
  {
    label: "Developer Tools",
    tools: [
      {
        title: "Diagram",
        description: "Flowcharts & sequence diagrams",
        icon: GitBranch,
        href: "/workspace/diagram",
        color: "purple",
        tags: ["Mermaid", "SVG", "PNG"],
      },
      {
        title: "JSON",
        description: "Format & validate JSON",
        icon: FileJson,
        href: "/workspace/json-formatter",
        color: "cyan",
        tags: ["Format", "Validate", "Minify"],
      },
      {
        title: "Color",
        description: "HEX, RGB, HSL converter",
        icon: Palette,
        href: "/workspace/color-converter",
        color: "purple",
        tags: ["HEX", "RGB", "HSL"],
      },
      {
        title: "Hash",
        description: "MD5, SHA-1, SHA-256",
        icon: Hash,
        href: "/workspace/hash-generator",
        color: "purple",
        tags: ["MD5", "SHA-256", "Web Crypto"],
      },
    ],
  },
  {
    label: "Utilities",
    tools: [
      {
        title: "Pomodoro",
        description: "Focus timer",
        icon: Clock,
        href: "/workspace/pomodoro",
        color: "orange",
        tags: ["Timer", "Audio"],
      },
      {
        title: "QR Code",
        description: "Generate QR codes",
        icon: QrCode,
        href: "/workspace/qr-generator",
        color: "cyan",
        tags: ["Canvas", "PNG"],
      },
    ],
  },
  {
    label: "Games",
    tools: [
      {
        title: "Arknights",
        description: "Headhunting probability calculator",
        icon: Crosshair,
        href: "/arknights",
        color: "orange",
        tags: ["Probability", "Official Rules"],
      },
    ],
  },
];

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind",
  "Mermaid",
  "Web Crypto",
  "Canvas",
];

const colorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    tag: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    tag: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    tag: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  },
};

export default function WorkspacePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-16 md:py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-3">
              <Boxes className="h-7 w-7 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Workspace
              </h1>
              <p className="text-sm text-zinc-500">
                7 tools across 3 categories
              </p>
            </div>
          </div>
        </motion.div>

        {categories.map((category, catIndex) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + catIndex * 0.1 }}
            className="mb-10"
          >
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              {category.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.tools.map((tool, index) => {
                const c = colorMap[tool.color];
                return (
                  <BentoCard
                    key={tool.title}
                    className="group h-full"
                    delay={catIndex * 2 + index}
                    href={tool.href}
                  >
                    <div className="flex h-full flex-col">
                      <div className="mb-3 flex items-start justify-between">
                        <div className={`rounded-lg p-2 ${c.bg}`}>
                          <tool.icon className={`h-5 w-5 ${c.text}`} />
                        </div>
                        <ArrowUpRight
                          className={`h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${c.text}`}
                        />
                      </div>
                      <h3 className="mb-1 text-base font-semibold text-white">
                        {tool.title}
                      </h3>
                      <p className="mb-3 text-xs text-zinc-500">
                        {tool.description}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-1.5">
                        {tool.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded border px-1.5 py-0.5 text-[10px] ${c.tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </BentoCard>
                );
              })}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <BentoCard delay={10}>
            <h3 className="mb-4 text-sm font-medium text-zinc-400">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </BentoCard>
        </motion.div>

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
