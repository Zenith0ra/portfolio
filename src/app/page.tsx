"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Boxes,
  GraduationCap,
  Award,
  Code,
  Code2,
  BookOpen,
  Users,
  MapPin,
  Calendar,
  Mail,
  MessageCircle,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { BentoCard } from "@/components/BentoCard";

const timeline = [
  {
    year: "2023.9",
    title: "Entered Tsinghua University",
    description:
      "Started CS journey. Became class organizer (组织委员) for Class 33.",
    icon: GraduationCap,
  },
  {
    year: "2024.9",
    title: "Class Monitor (班长)",
    description:
      "Responsible for daily management, activity coordination, and class cohesion. Led Class 33 to Outstanding League Branch (甲级团支部) honor.",
    icon: Users,
  },
  {
    year: "2025",
    title: "Junior Year",
    description:
      "Focusing on OS, Computer Networks, Databases, and AI courses.",
    icon: Code,
  },
  {
    year: "2026",
    title: "Senior Year",
    description:
      "Upcoming senior year, preparing for graduation and research.",
    icon: GraduationCap,
  },
];

const awards = [
  {
    name: "志愿公益优秀奖学金",
    year: "2025",
    org: "Tsinghua University",
  },
  {
    name: "志愿公益优秀奖学金",
    year: "2024",
    org: "Tsinghua University",
  },
  {
    name: "新生优秀奖学金",
    year: "2023",
    org: "Tsinghua University",
  },
  {
    name: "河南省三好学生",
    year: "2023",
    org: "Henan Province",
  },
];

const contacts = [
  {
    label: "Academic",
    value: "hlz23@mails.tsinghua.edu.cn",
    href: "mailto:hlz23@mails.tsinghua.edu.cn",
    icon: Mail,
  },
  {
    label: "Personal",
    value: "houlinzhi23411082@gmail.com",
    href: "mailto:houlinzhi23411082@gmail.com",
    icon: Mail,
  },
  { label: "WeChat", value: "Zenith0ra", href: null, icon: MessageCircle },
  { label: "QQ", value: "3098714681", href: null, icon: Hash },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-16 md:py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/avatar.jpg"
                alt="Avatar"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Linzhi Hou · 侯林之
              </h1>
              <p className="mt-1 text-zinc-400">
                Senior CST Student @ Tsinghua University
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Beijing, China
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Class of 2023
                </span>
              </div>
            </div>
          </div>

          <blockquote className="mb-4 border-l-2 border-white/20 pl-4 text-sm italic text-zinc-500">
            &quot;Computer science is no more about computers than astronomy is
            about telescopes.&quot; — Edsger W. Dijkstra
          </blockquote>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            A passionate Computer Science and Technology student at Tsinghua
            University, currently in my junior year. I navigate the
            computational landscape with curiosity and rigor, cultivating
            expertise across computational theory, artificial intelligence, and
            open-source ecosystems. I approach each challenge as both an
            engineer and an artist — methodically deconstructing problems while
            crafting elegant solutions.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <span className="flex flex-shrink-0 items-center gap-1.5 text-xs text-zinc-500">
                  <contact.icon className="h-3 w-3" />
                  {contact.label}
                </span>
                {contact.href ? (
                  <a
                    href={contact.href}
                    className="truncate text-xs text-cyan-400 hover:underline"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <span className="truncate text-xs text-zinc-300">
                    {contact.value}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <BentoCard className="md:col-span-2" delay={2}>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <Calendar className="h-5 w-5 text-purple-400" />
              Journey
            </h3>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="mt-2 h-full w-px bg-white/10" />
                    )}
                  </div>
                  <div className="pb-6">
                    <span className="text-xs font-medium text-purple-400">
                      {item.year}
                    </span>
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <p className="text-sm text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-1" delay={3}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Award className="h-5 w-5 text-orange-400" />
              Awards
            </h3>
            <div className="space-y-3">
              {awards.map((award, index) => (
                <motion.div
                  key={`${award.name}-${award.year}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-lg border border-white/5 bg-white/5 p-3"
                >
                  <p className="text-sm font-medium text-white">
                    {award.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{award.org}</span>
                    <span>•</span>
                    <span>{award.year}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </BentoCard>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BentoCard className="group" delay={8} href="/workspace">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <Boxes className="h-6 w-6 text-cyan-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white">Workspace</h3>
            <p className="mt-1 text-sm text-zinc-500">Tools &amp; experiments</p>
          </BentoCard>

          <BentoCard className="group" delay={9} href="https://blog.houlinzhi.com">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white">Blog</h3>
            <p className="mt-1 text-sm text-zinc-500">Thoughts, tutorials &amp; notes</p>
          </BentoCard>

          <BentoCard className="group" delay={10} href="https://github.com/Zenith0ra">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <Code2 className="h-6 w-6 text-cyan-400" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white">GitHub</h3>
            <p className="mt-1 text-sm text-zinc-500">Open source projects</p>
          </BentoCard>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Linzhi Hou
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
