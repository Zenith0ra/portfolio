"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import Link from "next/link";
import { GlowingOrb } from "@/components/GlowingOrb";

type TimerMode = "work" | "break";

const WORK_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode ?? mode;
    setTimeLeft(targetMode === "work" ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      // Timer finished
      const timer = setTimeout(() => {
        if (mode === "work") {
          setSessions((prev) => prev + 1);
          switchMode("break");
        } else {
          switchMode("work");
        }
        // Play notification sound
        if (typeof window !== "undefined" && "Notification" in window) {
          new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2Xi3RkYHODj5mYkYN0aGJzgpGam5WJfHFqb3qHkpaWkYh9dHBweIOMkZOSj4l/eXZ1eX+EiYyOjo2Jg316eHl7foKGiYqKiYaDgH17e3x9f4KDhYaGhoWDgYB+fX1+f4GCg4SEhIOCgYB/fn5+f4CBgoKDg4OCgoGAf39/f4CAgYGCgoKCgoGBgICAf4CAgIGBgYGBgYGBgYGAgICAgICAgIGBgYGBgYGBgYCAgICAgICAgIGBgQ==").play().catch(() => { });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, mode, switchMode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = mode === "work"
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden noise-overlay">
      <div className="fixed inset-0 bg-grid-pattern" />
      <GlowingOrb color="rgba(255, 107, 53, 0.12)" size={500} top="-100px" right="-100px" delay={0.2} />
      <GlowingOrb color="rgba(168, 85, 247, 0.08)" size={400} bottom="10%" left="-100px" delay={0.4} />

      <main className="relative z-10 mx-auto max-w-md px-6 py-16 md:py-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/workspace" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-3">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <h1 className="gradient-text text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
          <p className="mt-2 text-zinc-500">Stay focused, take breaks</p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-8">
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => switchMode("work")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${mode === "work" ? "bg-orange-500/20 text-orange-400" : "text-zinc-500 hover:text-white"
                }`}
            >
              <Brain className="h-4 w-4" />
              Work
            </button>
            <button
              onClick={() => switchMode("break")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${mode === "break" ? "bg-green-500/20 text-green-400" : "text-zinc-500 hover:text-white"
                }`}
            >
              <Coffee className="h-4 w-4" />
              Break
            </button>
          </div>
        </motion.div>

        {/* Timer Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-8">
          <div className="relative w-64 h-64 mx-auto">
            {/* Progress Ring */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                className={`transition-all duration-1000 ${mode === "work" ? "text-orange-500" : "text-green-500"}`}
              />
            </svg>
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white font-mono">{formatTime(timeLeft)}</span>
              <span className={`mt-2 text-sm font-medium ${mode === "work" ? "text-orange-400" : "text-green-400"}`}>
                {mode === "work" ? "Focus Time" : "Break Time"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-medium transition-all ${isRunning
                ? "bg-white/10 text-white hover:bg-white/20"
                : mode === "work"
                  ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </button>
          <button
            onClick={() => resetTimer()}
            className="flex items-center justify-center rounded-xl px-4 py-4 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Sessions Counter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2">
            <span className="text-sm text-zinc-500">Sessions completed:</span>
            <span className="text-lg font-bold text-white">{sessions}</span>
          </div>
        </motion.div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </motion.footer>
      </main>
    </div>
  );
}

