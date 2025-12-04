"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Boxes, Rocket, Wrench } from "lucide-react";
import Link from "next/link";
import { GlowingOrb } from "@/components/GlowingOrb";
import { BentoCard } from "@/components/BentoCard";

const projects = [
  {
    title: "Clipboard Share",
    description: "Cross-device clipboard & file sharing with auto-expiry",
    status: "planned",
    icon: Rocket,
  },
  {
    title: "Dev Tools",
    description: "Collection of useful utilities for developers",
    status: "planned",
    icon: Wrench,
  },
];

export default function WorkspacePage() {
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
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-3">
              <Boxes className="h-8 w-8 text-orange-400" />
            </div>
            <h1 className="gradient-text text-4xl font-bold tracking-tight">
              Workspace
            </h1>
          </div>
          <p className="max-w-lg text-lg text-zinc-400">
            My personal collection of tools, experiments, and fun little
            projects. Feel free to explore and play around!
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => (
            <BentoCard
              key={project.title}
              glowColor="orange"
              delay={index + 2}
              className="cursor-default"
            >
              <div className="flex flex-col">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-white/5 p-3">
                    <project.icon className="h-5 w-5 text-zinc-400" />
                  </div>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
                    {project.status}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-500">{project.description}</p>
              </div>
            </BentoCard>
          ))}

          {/* Add Project Card */}
          <BentoCard
            glowColor="purple"
            delay={4}
            className="cursor-default border-dashed md:col-span-2"
          >
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="mb-2 text-lg font-medium text-zinc-400">
                More coming soon
              </h3>
              <p className="max-w-sm text-sm text-zinc-600">
                I&apos;m always building something new. Check back later for
                more tools and fun stuff!
              </p>
            </div>
          </BentoCard>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Linzhi Hou. Built with curiosity.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
