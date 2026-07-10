"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Download, Copy, Check } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

export default function QRGeneratorPage() {
  const [text, setText] = useState("https://houlinzhi.com");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!text.trim()) {
        setQrDataUrl("");
        setError("");
        return;
      }

      try {
        // Generate QR code to canvas
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, text, {
            width: 280,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
            errorCorrectionLevel: "M",
          });
          
          // Get data URL from canvas
          const dataUrl = canvasRef.current.toDataURL("image/png");
          setQrDataUrl(dataUrl);
          setError("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成失败");
        setQrDataUrl("");
      }
    };

    generateQR();
  }, [text]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: copy data URL as text
      if (qrDataUrl) {
        await navigator.clipboard.writeText(qrDataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 mx-auto max-w-md px-6 py-16 md:py-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/workspace" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-3">
              <QrCode className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">QR Generator</h1>
          <p className="mt-2 text-zinc-500">Create scannable QR codes</p>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Enter text or URL</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com"
            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* QR Code Display */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-6">
          <div className="bg-white rounded-2xl p-4 mx-auto w-fit">
            <canvas
              ref={canvasRef}
              className="block"
              style={{ display: text.trim() ? "block" : "none" }}
            />
            {!text.trim() && (
              <div className="w-[280px] h-[280px] flex items-center justify-center text-zinc-400 text-sm">
                Enter text to generate QR code
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex justify-center gap-3">
          <button
            onClick={downloadQR}
            disabled={!qrDataUrl}
            className="flex items-center gap-2 rounded-xl bg-cyan-500/20 px-5 py-3 text-sm font-medium text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!qrDataUrl}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-zinc-500 text-center">
            Supports URLs, text, email, phone numbers, WiFi credentials, and more.
            <br />
            Scan with any QR code reader app.
          </p>
        </motion.div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 text-center">
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} Linzhi Hou</p>
        </motion.footer>
      </main>
    </div>
  );
}
