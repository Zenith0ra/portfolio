"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Palette, Copy, Check, RefreshCw } from "lucide-react";
import Link from "next/link";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#6366f1");
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState<HSL>({ h: 239, s: 84, l: 67 });
  const [copied, setCopied] = useState<string | null>(null);

  const updateFromHex = useCallback((value: string) => {
    const cleanHex = value.startsWith("#") ? value : "#" + value;
    setHex(cleanHex);
    const rgbValue = hexToRgb(cleanHex);
    if (rgbValue) {
      setRgb(rgbValue);
      setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const rgbValue = hslToRgb(h, s, l);
    setRgb(rgbValue);
    setHex(rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b));
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateFromRgb(r, g, b);
  };

  const hexString = hex.toUpperCase();
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-16 md:py-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/workspace" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Palette className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">Color Converter</h1>
              <p className="text-zinc-500">Convert between HEX, RGB, and HSL</p>
            </div>
          </div>
        </motion.div>

        {/* Color Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6">
          <div
            className="h-32 rounded-2xl border border-white/10 transition-colors"
            style={{ backgroundColor: hex }}
          />
          <div className="mt-3 flex justify-center">
            <button
              onClick={randomColor}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Random Color
            </button>
          </div>
        </motion.div>

        {/* Color Inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-4">
          {/* HEX */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-400">HEX</label>
              <button
                onClick={() => copyToClipboard(hexString, "hex")}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied === "hex" ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied === "hex" ? "Copied" : "Copy"}
              </button>
            </div>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-full bg-transparent text-xl font-mono text-white focus:outline-none"
              placeholder="#000000"
            />
          </div>

          {/* RGB */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-400">RGB</label>
              <button
                onClick={() => copyToClipboard(rgbString, "rgb")}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied === "rgb" ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied === "rgb" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["r", "g", "b"] as const).map((channel) => (
                <div key={channel} className="flex flex-col">
                  <span className="text-xs text-zinc-500 mb-1 uppercase">{channel}</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[channel]}
                    onChange={(e) => {
                      const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      updateFromRgb(
                        channel === "r" ? val : rgb.r,
                        channel === "g" ? val : rgb.g,
                        channel === "b" ? val : rgb.b
                      );
                    }}
                    className="w-full bg-white/5 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* HSL */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-400">HSL</label>
              <button
                onClick={() => copyToClipboard(hslString, "hsl")}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied === "hsl" ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied === "hsl" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 mb-1">H (0-360)</span>
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={hsl.h}
                  onChange={(e) => updateFromHsl(Math.min(360, Math.max(0, parseInt(e.target.value) || 0)), hsl.s, hsl.l)}
                  className="w-full bg-white/5 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 mb-1">S (0-100)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl.s}
                  onChange={(e) => updateFromHsl(hsl.h, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)), hsl.l)}
                  className="w-full bg-white/5 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 mb-1">L (0-100)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl.l}
                  onChange={(e) => updateFromHsl(hsl.h, hsl.s, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-white/5 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </motion.footer>
      </main>
    </div>
  );
}

