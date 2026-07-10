"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Code2,
  Crosshair,
  User,
  MapPin,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { BentoCard } from "@/components/BentoCard";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <BentoCard className="mb-4" delay={1}>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800">
            <Image
              src="/avatar.jpg"
              alt="Avatar"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold tracking-tight text-white"
            >
              Linzhi Hou
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-zinc-400"
            >
              侯林之
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1 font-mono text-sm text-cyan-400"
            >
              @Zenith0ra
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500"
            >
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Beijing, China
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                hlz23@mails.tsinghua.edu.cn
              </span>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2"
          >
            <a
              href="https://github.com/Zenith0ra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white hover:border-white/20"
            >
              <Code2 className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://blog.houlinzhi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white hover:border-white/20"
            >
              <BookOpen className="h-4 w-4" /> Blog
            </a>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-5 text-zinc-400 leading-relaxed"
        >
          CS Junior at <span className="text-white">Tsinghua University</span>.
          Passionate about computer graphics, AI, and building tools that make a difference.
        </motion.p>
      </BentoCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <BentoCard className="group" delay={2} href="/arknights">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-orange-500/10 p-3">
              <Crosshair className="h-6 w-6 text-orange-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-orange-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white">Arknights</h3>
          <p className="mt-1 text-sm text-zinc-500">Headhunting probability tool</p>
        </BentoCard>

        <BentoCard className="group" delay={3} href="/workspace">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-cyan-500/10 p-3">
              <Boxes className="h-6 w-6 text-cyan-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white">Workspace</h3>
          <p className="mt-1 text-sm text-zinc-500">Tools & experiments</p>
        </BentoCard>

        <BentoCard className="group" delay={4} href="/about">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <User className="h-6 w-6 text-purple-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white">About</h3>
          <p className="mt-1 text-sm text-zinc-500">More about me</p>
        </BentoCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <BentoCard className="group" delay={5} href="https://blog.houlinzhi.com">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white">Blog</h3>
          <p className="mt-1 text-sm text-zinc-500">Thoughts, tutorials & notes</p>
        </BentoCard>

        <BentoCard className="group" delay={6} href="https://github.com/Zenith0ra">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-cyan-500/10 p-3">
              <Code2 className="h-6 w-6 text-cyan-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white">GitHub</h3>
          <p className="mt-1 text-sm text-zinc-500">Open source projects</p>
        </BentoCard>

        <BentoCard delay={7}>
          <div className="flex h-full flex-col justify-center">
            <p className="font-mono text-sm text-zinc-500">
              <span className="text-purple-400">&quot;</span>
              Stay curious, keep building.
              <span className="text-purple-400">&quot;</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-zinc-600">Available</span>
            </div>
          </div>
        </BentoCard>
      </div>

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
  );
}
