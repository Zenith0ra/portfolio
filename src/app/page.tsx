"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Code2,
  Sparkles,
} from "lucide-react";
import { BentoCard } from "@/components/BentoCard";
import { SocialLinks } from "@/components/SocialLinks";
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
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:text-left"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to my corner of the internet</span>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-3">
          {/* Profile Card - Large */}
          <BentoCard
            className="md:col-span-2 md:row-span-2"
            glowColor="cyan"
            delay={1}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 p-[2px]"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-950 text-2xl font-bold">
                    Z
                  </div>
                </motion.div>

                {/* Name & Title */}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="gradient-text mb-2 text-4xl font-bold tracking-tight md:text-5xl"
                >
                  Linzhi Hou
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4 font-mono text-sm text-cyan-400"
                >
                  @Zenith0ra
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="max-w-md text-lg leading-relaxed text-zinc-400"
                >
                  Computer Science Undergrad at{" "}
                  <span className="text-white">Tsinghua University</span>.
                  Building things that matter, one commit at a time.
                </motion.p>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <SocialLinks />
              </div>
            </div>
          </BentoCard>

          {/* Blog Card */}
          <BentoCard
            className="group md:row-span-1"
            glowColor="purple"
            delay={2}
            href="https://blog.houlinzhi.com"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-purple-500/10 p-3">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-purple-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-white">Blog</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Thoughts & tutorials
                </p>
              </div>
            </div>
          </BentoCard>

          {/* GitHub Card */}
          <BentoCard
            className="group"
            glowColor="cyan"
            delay={3}
            href="https://github.com/Zenith0ra"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <Code2 className="h-6 w-6 text-cyan-400" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-white">GitHub</h3>
                <p className="mt-1 text-sm text-zinc-500">Open source work</p>
              </div>
            </div>
          </BentoCard>

          {/* Workspace Card - Wide */}
          <BentoCard
            className="group md:col-span-2"
            glowColor="orange"
            delay={4}
            href="/workspace"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <Boxes className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Workspace</h3>
                  <p className="text-sm text-zinc-500">
                    Tools & fun projects
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
                  Coming Soon
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-400" />
              </div>
            </div>
          </BentoCard>

          {/* Status/Quote Card */}
          <BentoCard className="md:row-span-1" glowColor="purple" delay={5}>
            <div className="flex h-full flex-col justify-center">
              <p className="font-mono text-sm leading-relaxed text-zinc-500">
                <span className="text-purple-400">&quot;</span>
                Stay curious, keep building.
                <span className="text-purple-400">&quot;</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs text-zinc-600">
                  Available for opportunities
                </span>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Linzhi Hou. Crafted with{" "}
            <span className="text-red-500">♥</span> and Next.js
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
