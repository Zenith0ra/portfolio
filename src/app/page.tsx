"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Code2,
  Crosshair,
  Sparkles,
  User,
  MapPin,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { BentoCard } from "@/components/BentoCard";
import { GlowingOrb } from "@/components/GlowingOrb";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden noise-overlay">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern" />
      <GlowingOrb
        color="rgba(0, 212, 255, 0.15)"
        size={600}
        top="-200px"
        right="-200px"
        delay={0.2}
      />
      <GlowingOrb
        color="rgba(168, 85, 247, 0.1)"
        size={500}
        bottom="-150px"
        left="-150px"
        delay={0.4}
      />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to my corner of the internet</span>
          </div>
        </motion.div>

        {/* Profile Section */}
        <BentoCard className="mb-4" glowColor="cyan" delay={1}>
          <div className="flex flex-col sm:flex-row gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className="h-24 w-24 flex-shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 p-[2px]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-zinc-950">
                <Image
                  src="/avatar.jpg"
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="gradient-text text-3xl font-bold tracking-tight"
              >
                Linzhi Hou
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-lg text-zinc-400"
              >
                侯林之
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-1 font-mono text-sm text-cyan-400"
              >
                @Zenith0ra
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
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
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-zinc-400 leading-relaxed"
          >
            CS Junior at <span className="text-white">Tsinghua University</span>.
            Passionate about computer graphics, AI, and building tools that make a difference.
            Currently focusing on OS, Networks, and AI courses.
          </motion.p>
        </BentoCard>

        {/* Grid - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Blog */}
          <BentoCard
            className="group"
            glowColor="purple"
            delay={2}
            href="https://blog.houlinzhi.com"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="text-lg font-semibold text-white">Blog</h3>
            <p className="mt-1 text-sm text-zinc-500">Thoughts, tutorials & notes</p>
          </BentoCard>

          {/* GitHub */}
          <BentoCard
            className="group"
            glowColor="cyan"
            delay={3}
            href="https://github.com/Zenith0ra"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Code2 className="h-6 w-6 text-cyan-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="text-lg font-semibold text-white">GitHub</h3>
            <p className="mt-1 text-sm text-zinc-500">Open source projects</p>
          </BentoCard>

          {/* Arknights */}
          <BentoCard
            className="group"
            glowColor="orange"
            delay={4}
            href="/arknights"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-orange-500/10 p-3">
                <Crosshair className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-300">
                  New
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white">Arknights</h3>
            <p className="mt-1 text-sm text-zinc-500">Operator notes & field archive</p>
          </BentoCard>

          {/* Workspace */}
          <BentoCard
            className="group"
            glowColor="cyan"
            delay={5}
            href="/workspace"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Boxes className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                  New
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white">Workspace</h3>
            <p className="mt-1 text-sm text-zinc-500">Tools & experiments</p>
          </BentoCard>

          {/* About */}
          <BentoCard
            className="group"
            glowColor="purple"
            delay={6}
            href="/about"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="text-lg font-semibold text-white">About</h3>
            <p className="mt-1 text-sm text-zinc-500">More about me</p>
          </BentoCard>
        </div>

        {/* Quote */}
        <BentoCard glowColor="purple" delay={7}>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-zinc-500">
              <span className="text-purple-400">&quot;</span>
              Stay curious, keep building.
              <span className="text-purple-400">&quot;</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs text-zinc-600">Available</span>
            </div>
          </div>
        </BentoCard>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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
