"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  GraduationCap,
  Award,
  Heart,
  Code,
  BookOpen,
  Users,
  MapPin,
  Calendar,
  Mail,
  Palette,
  Brain,
  Github,
  Globe,
  FolderGit2,
  HandHeart,
} from "lucide-react";
import { BentoCard } from "@/components/BentoCard";

const timeline = [
  {
    year: "2023",
    title: "Entered Tsinghua University",
    description: "Started CS journey, became class organizer",
    icon: GraduationCap,
  },
  {
    year: "2024",
    title: "Class Monitor",
    description: "Led Class 33 to Outstanding League Branch honor",
    icon: Users,
  },
  {
    year: "2025",
    title: "Junior Year",
    description: "Focusing on OS, Networks, and AI courses",
    icon: Code,
  },
];

const awards = [
  { name: "Volunteer Service Scholarship", year: "2024", org: "Tsinghua" },
  { name: "Freshman Excellence Scholarship", year: "2023", org: "Tsinghua" },
  { name: "Provincial Merit Student", year: "2023", org: "Henan" },
];

const interests = [
  { name: "Graphics", icon: Palette, color: "text-purple-400" },
  { name: "AI", icon: Brain, color: "text-cyan-400" },
  { name: "Open Source", icon: Github, color: "text-orange-400" },
  { name: "Web Dev", icon: Globe, color: "text-green-400" },
];

const skills = {
  languages: ["C/C++", "Python", "Rust", "TypeScript", "HTML/CSS"],
  frameworks: ["React", "Next.js", "Django", "Node.js"],
  tools: ["Git", "Docker", "Linux", "VS Code"],
};

const projects = [
  {
    name: "Personal Website",
    tech: "Next.js + Tailwind",
    description:
      "Portfolio with Arknights probability tool, workspace utilities, and blog integration",
    year: "2025",
  },
  {
    name: "Tech Blog",
    tech: "Jekyll + Chirpy",
    description:
      "32 posts on computer graphics, AI, and algorithms with PWA and search",
    year: "2024",
  },
  {
    name: "Algorithm Practice",
    tech: "C++ / Python",
    description:
      "Continuous practice on LeetCode covering DP, graph theory, and sorting",
    year: "2023 - present",
  },
];

const volunteer = [
  { name: "Alumni Homecoming Service", date: "2025-05" },
  { name: "Campus Tour Guide", date: "2025-05" },
  { name: "Embrace Alma Mater (Round 23)", date: "2025-03" },
  { name: "College Entrance Recruitment", date: "2024-09" },
  { name: "Ma Yuehan Cup Athletics", date: "2024-05" },
  { name: "Embrace Alma Mater (Round 22)", date: "2024-03" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800 text-2xl font-bold text-white">
              Z
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Linzhi Hou
              </h1>
              <p className="mt-1 text-zinc-400">侯林之</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Beijing, China
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  hlz23@mails.tsinghua.edu.cn
                </span>
              </div>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            A passionate Computer Science student at Tsinghua University,
            currently in my junior year. Interested in computer graphics,
            artificial intelligence, and building tools that make a difference.
          </p>
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
                    <p className="text-sm text-zinc-500">{item.description}</p>
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
                  key={award.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-lg border border-white/5 bg-white/5 p-3"
                >
                  <p className="text-sm font-medium text-white">{award.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{award.org}</span>
                    <span>•</span>
                    <span>{award.year}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={4}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Code className="h-5 w-5 text-cyan-400" />
              Technical Skills
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.frameworks.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-1" delay={5}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Heart className="h-5 w-5 text-purple-400" />
              Interests
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {interests.map((interest, index) => (
                <motion.div
                  key={interest.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex flex-col items-center rounded-lg border border-white/5 bg-white/5 p-3 text-center"
                >
                  <interest.icon className={`mb-1.5 h-6 w-6 ${interest.color}`} />
                  <span className="text-xs text-zinc-400">{interest.name}</span>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2" delay={6}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <FolderGit2 className="h-5 w-5 text-cyan-400" />
              Projects
            </h3>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="rounded-lg border border-white/5 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-xs text-cyan-400">{project.tech}</p>
                    </div>
                    <span className="text-xs text-zinc-500">{project.year}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {project.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-1" delay={7}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <HandHeart className="h-5 w-5 text-orange-400" />
              Volunteer
            </h3>
            <div className="space-y-2">
              {volunteer.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-400">{item.name}</span>
                  <span className="text-xs text-zinc-600">{item.date}</span>
                </motion.div>
              ))}
            </div>
          </BentoCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-4"
        >
          <BentoCard className="group" delay={8} href="https://blog.houlinzhi.com">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-white/5 bg-cyan-500/10 p-4">
                  <BookOpen className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Read my blog</h3>
                  <p className="text-zinc-500">
                    I write about computer graphics, AI, algorithms, and my learning journey.
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-6 w-6 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </BentoCard>
        </motion.div>

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
