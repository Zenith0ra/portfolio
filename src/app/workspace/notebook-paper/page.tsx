"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import {
  PAGE_H_MM,
  PAGE_W_MM,
  buildPdf,
  downloadBlob,
  fileStamp,
  formatSize,
  lineGeometry,
  loadImage,
  renderBackground,
  type BackgroundFit,
  type EmbeddedImage,
  type NotebookSettings,
  type PdfPage,
} from "@/lib/notebook-pdf";

const DEFAULT_SETTINGS: NotebookSettings = {
  fit: "contain",
  bgOp: 0.14,
  bgBlur: 1.5,
  bgSat: 65,
  bgBri: 118,
  bgCon: 82,
  pitch: 8,
  lnG: 178,
  lw: 0.24,
  padTop: 16,
  padBottom: 14,
  padLeft: 15,
  padRight: 10,
  sideLine: false,
  edgeLine: true,
};

const PRESETS: Record<string, Partial<NotebookSettings>> = {
  Faint: { bgOp: 0.08, bgBlur: 3, bgSat: 45, bgBri: 128, bgCon: 72 },
  Normal: { bgOp: 0.14, bgBlur: 1.5, bgSat: 65, bgBri: 118, bgCon: 82 },
  Bold: { bgOp: 0.24, bgBlur: 0.5, bgSat: 85, bgBri: 112, bgCon: 90 },
};

/** 30-hole A4 punch */
const PUNCH = { count: 30, pitch: 9.35, diameter: 5.5, inset: 6.5 };

const A4_WIDTH_PX = (PAGE_W_MM / 25.4) * 96;
const A4_HEIGHT_PX = (PAGE_H_MM / 25.4) * 96;
const GRID_GAP = 20;

interface Photo {
  id: string;
  name: string;
  url: string;
}

let photoSeq = 0;

function Section({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card rounded-lg p-3.5">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </h2>
        {extra && (
          <span className="font-mono text-[10px] text-zinc-600">{extra}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 py-[3px]">
      <span className="w-[74px] shrink-0 text-[11px] text-zinc-400">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range min-w-0 flex-1 cursor-pointer"
      />
      <span className="w-[46px] shrink-0 text-right font-mono text-[10px] text-zinc-500">
        {display}
      </span>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-[3px] text-[11px] text-zinc-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer accent-purple-500"
      />
      {label}
    </label>
  );
}

function Sheet({
  isBack,
  index,
  photo,
  settings,
  showHoles,
  zoom,
}: {
  isBack: boolean;
  index: number;
  photo?: Photo;
  settings: NotebookSettings;
  showHoles: boolean;
  zoom: number;
}) {
  const geo = useMemo(
    () => lineGeometry(settings, isBack),
    [settings, isBack]
  );

  const holes = useMemo(() => {
    if (!showHoles) return [];
    const start = (PAGE_H_MM - (PUNCH.count - 1) * PUNCH.pitch) / 2;
    const cx = isBack ? PAGE_W_MM - PUNCH.inset : PUNCH.inset;
    return Array.from({ length: PUNCH.count }, (_, i) => ({
      x: cx,
      y: start + i * PUNCH.pitch,
    }));
  }, [isBack, showHoles]);

  return (
    <div className="shrink-0">
      <div
        className="mb-1.5 text-zinc-600"
        style={{ fontSize: `${11 / zoom}px` }}
      >
        {index + 1} · {isBack ? "Back" : "Front"}
      </div>
      <div
        className="relative overflow-hidden bg-white"
        style={{
          width: `${PAGE_W_MM}mm`,
          height: `${PAGE_H_MM}mm`,
          boxShadow: "0 10px 36px rgba(0,0,0,.55)",
        }}
      >
        {photo && (
          <div
            className="pointer-events-none absolute"
            style={{
              // contain keeps the whole photo inside the page, so it must not
              // extend into the 4mm bleed the way cover/fill do.
              inset: settings.fit === "contain" ? "0" : "-4mm",
              backgroundImage: `url("${photo.url}")`,
              backgroundSize:
                settings.fit === "fill"
                  ? "100% 100%"
                  : settings.fit === "contain"
                    ? "contain"
                    : "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: settings.bgOp,
              filter:
                `blur(${settings.bgBlur}px) saturate(${settings.bgSat}%) ` +
                `brightness(${settings.bgBri}%) contrast(${settings.bgCon}%)`,
            }}
          />
        )}

        <svg
          viewBox={`0 0 ${PAGE_W_MM} ${PAGE_H_MM}`}
          preserveAspectRatio="none"
          shapeRendering="geometricPrecision"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {geo.lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y}
              x2={l.x2}
              y2={l.y}
              stroke={`rgb(${l.g},${l.g},${l.g})`}
              strokeWidth={l.w}
            />
          ))}
          {geo.vlines.map((l, i) => (
            <line
              key={`v${i}`}
              x1={l.x}
              y1={l.y1}
              x2={l.x}
              y2={l.y2}
              stroke={`rgb(${l.g},${l.g},${l.g})`}
              strokeWidth={l.w}
            />
          ))}
        </svg>

        {holes.map((h, i) => (
          <div
            key={`h${i}`}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${h.x}mm`,
              top: `${h.y}mm`,
              width: `${PUNCH.diameter}mm`,
              height: `${PUNCH.diameter}mm`,
              transform: "translate(-50%, -50%)",
              border: "0.3mm dashed #e5484d",
              background: "rgba(229,72,77,.08)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function NotebookPaperPage() {
  const [settings, setSettings] =
    useState<NotebookSettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dpi, setDpi] = useState(150);
  const [showHoles, setShowHoles] = useState(true);
  const [zoom, setZoom] = useState(0.5);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const patch = useCallback(
    (p: Partial<NotebookSettings>) => setSettings((prev) => ({ ...prev, ...p })),
    []
  );

  const photosRef = useRef<Photo[]>(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setStage({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom drives everything: the sheet size, and how many sheets fit per row.
  const zoomManual = useRef(false);

  const fitZoom = useCallback(() => {
    const el = stageRef.current;
    if (!el) return 0.5;
    // clientWidth/Height include the 12px padding on each side; leave room for
    // the "1 · Front" caption that sits above every sheet.
    const w = el.clientWidth - 24;
    const h = el.clientHeight - 24 - 24;
    if (w <= 0 || h <= 0) return 0.5;
    const z = Math.min(w / A4_WIDTH_PX, h / A4_HEIGHT_PX);
    return Math.round(Math.max(0.2, Math.min(2, z)) * 100) / 100;
  }, []);

  const applyZoom = useCallback((z: number, manual = true) => {
    zoomManual.current = manual;
    setZoom(Math.round(Math.max(0.2, Math.min(2, z)) * 100) / 100);
  }, []);

  // Until the user touches the slider, keep the whole sheet in view.
  useEffect(() => {
    if (!stage.w || !stage.h || zoomManual.current) return;
    setZoom(fitZoom());
  }, [stage, fitZoom]);

  // Column count follows from the zoom level, so the grid reflows on its own.
  const cols = useMemo(() => {
    if (!stage.w) return 1;
    const sheetW = A4_WIDTH_PX * zoom;
    return Math.max(
      1,
      Math.floor((stage.w + GRID_GAP) / (sheetW + GRID_GAP))
    );
  }, [stage.w, zoom]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    list.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
    if (!list.length) return;
    setPhotos((prev) => [
      ...prev,
      ...list.map((f) => ({
        id: `p${++photoSeq}`,
        name: f.name,
        url: URL.createObjectURL(f),
      })),
    ]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  const sheets = useMemo(
    () => (photos.length ? photos : [undefined]),
    [photos]
  );

  const lineCount = useMemo(
    () => lineGeometry(settings, false).lines.length,
    [settings]
  );

  const exportPdf = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatus("Preparing…");
    setProgress(2);

    try {
      const embedded: EmbeddedImage[] = [];
      for (let i = 0; i < photos.length; i++) {
        setStatus(`Rendering image ${i + 1} / ${photos.length}`);
        setProgress(5 + (80 * i) / photos.length);
        await new Promise((r) => setTimeout(r, 0));
        const img = await loadImage(photos[i].url);
        embedded.push(renderBackground(img, settings, dpi));
        await new Promise((r) => setTimeout(r, 0));
      }

      setStatus("Writing PDF…");
      setProgress(90);
      await new Promise((r) => setTimeout(r, 0));

      const n = Math.max(1, embedded.length);
      const pages: PdfPage[] = [];
      for (let i = 0; i < n; i++) {
        const idx = embedded.length ? i % embedded.length : -1;
        pages.push({ isBack: false, imgIdx: idx });
        pages.push({ isBack: true, imgIdx: idx });
      }

      const blob = buildPdf(pages, embedded, settings);
      const name = `notebook-paper_${fileStamp()}_${pages.length}p.pdf`;
      downloadBlob(blob, name);

      setStatus(`${name} · ${formatSize(blob.size)}`);
      setProgress(100);
      setTimeout(() => setProgress(0), 2000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to build the PDF");
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }, [busy, dpi, photos, settings]);

  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/workspace"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Printer className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Notebook Paper
              </h1>
              <p className="text-sm text-zinc-500">
                Printable A4 ruled sheets with a faded background
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* ---------- controls ---------- */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3.5"
          >
            <Section title="Image">
              {photos.length > 0 && (
                <div className="mb-3 grid grid-cols-4 gap-1.5">
                  {photos.map((p, i) => (
                    <div
                      key={p.id}
                      className="group relative aspect-[3/4] overflow-hidden rounded border border-white/10 bg-cover bg-center"
                      style={{ backgroundImage: `url("${p.url}")` }}
                      title={p.name}
                    >
                      <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[9px] leading-4 text-white">
                        {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        aria-label={`Remove ${p.name}`}
                        className="absolute right-1 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              <div className="mb-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[11px] text-zinc-300 transition-colors hover:bg-white/10"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={clearPhotos}
                  disabled={!photos.length}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[11px] text-zinc-400 transition-colors hover:bg-white/10 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>

              <label className="mb-3 flex items-center gap-2">
                <span className="w-[74px] shrink-0 text-[11px] text-zinc-400">
                  Fill
                </span>
                <select
                  value={settings.fit}
                  onChange={(e) =>
                    patch({ fit: e.target.value as BackgroundFit })
                  }
                  className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Fit</option>
                  <option value="fill">Stretch</option>
                </select>
              </label>

              <div className="mb-2 flex gap-1.5">
                {Object.keys(PRESETS).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => patch(PRESETS[name])}
                    className="flex-1 rounded-md border border-white/10 bg-white/5 py-1.5 text-[10px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <Slider
                label="Opacity"
                value={settings.bgOp}
                min={0}
                max={0.4}
                step={0.01}
                display={`${Math.round(settings.bgOp * 100)}%`}
                onChange={(v) => patch({ bgOp: v })}
              />
              <Slider
                label="Blur"
                value={settings.bgBlur}
                min={0}
                max={8}
                step={0.5}
                display={`${settings.bgBlur.toFixed(1)}px`}
                onChange={(v) => patch({ bgBlur: v })}
              />
              <Slider
                label="Saturation"
                value={settings.bgSat}
                min={0}
                max={140}
                step={5}
                display={`${settings.bgSat}%`}
                onChange={(v) => patch({ bgSat: v })}
              />
              <Slider
                label="Brightness"
                value={settings.bgBri}
                min={90}
                max={180}
                step={2}
                display={`${settings.bgBri}%`}
                onChange={(v) => patch({ bgBri: v })}
              />
              <Slider
                label="Contrast"
                value={settings.bgCon}
                min={50}
                max={130}
                step={2}
                display={`${settings.bgCon}%`}
                onChange={(v) => patch({ bgCon: v })}
              />
            </Section>

            <Section title="Lines" extra={`${lineCount} lines`}>
              <Slider
                label="Spacing"
                value={settings.pitch}
                min={6}
                max={10}
                step={0.25}
                display={`${settings.pitch}mm`}
                onChange={(v) => patch({ pitch: v })}
              />
              <Slider
                label="Weight"
                value={settings.lw}
                min={0.1}
                max={0.6}
                step={0.02}
                display={`${settings.lw.toFixed(2)}mm`}
                onChange={(v) => patch({ lw: v })}
              />
              <Slider
                label="Gray"
                value={settings.lnG}
                min={120}
                max={225}
                step={1}
                display={`#${Math.round(settings.lnG)
                  .toString(16)
                  .padStart(2, "0")
                  .repeat(3)}`}
                onChange={(v) => patch({ lnG: v })}
              />
              <Slider
                label="Top"
                value={settings.padTop}
                min={8}
                max={36}
                step={1}
                display={`${settings.padTop}mm`}
                onChange={(v) => patch({ padTop: v })}
              />
              <Slider
                label="Bottom"
                value={settings.padBottom}
                min={6}
                max={30}
                step={1}
                display={`${settings.padBottom}mm`}
                onChange={(v) => patch({ padBottom: v })}
              />
              <Slider
                label="Binding"
                value={settings.padLeft}
                min={10}
                max={34}
                step={1}
                display={`${settings.padLeft}mm`}
                onChange={(v) => patch({ padLeft: v })}
              />
              <Slider
                label="Outer"
                value={settings.padRight}
                min={6}
                max={24}
                step={1}
                display={`${settings.padRight}mm`}
                onChange={(v) => patch({ padRight: v })}
              />
              <div className="mt-2 space-y-0.5">
                <Toggle
                  label="Divider line"
                  checked={settings.sideLine}
                  onChange={(v) => patch({ sideLine: v })}
                />
                <Toggle
                  label="Bold first & last"
                  checked={settings.edgeLine}
                  onChange={(v) => patch({ edgeLine: v })}
                />
                <Toggle
                  label="Punch holes"
                  checked={showHoles}
                  onChange={setShowHoles}
                />
              </div>
            </Section>

            <Section
              title="Export"
              extra={`${photos.length || 1} sheets`}
            >
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="shrink-0 text-[11px] text-zinc-400">DPI</span>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(parseInt(e.target.value, 10))}
                  className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                >
                  <option value={120}>120</option>
                  <option value={150}>150</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <button
                type="button"
                onClick={exportPdf}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500/20 px-4 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {busy ? "Building…" : "Download PDF"}
              </button>

              {progress > 0 && (
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-purple-500 transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {status && (
                <p className="mt-2 break-all font-mono text-[10px] text-zinc-500">
                  {status}
                </p>
              )}
            </Section>
          </motion.aside>

          {/* ---------- preview ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex h-[calc(100dvh-260px)] min-h-[420px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#141416] transition-colors"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-3 py-2">
              <span className="shrink-0 text-[11px] text-zinc-400">Zoom</span>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.01}
                value={zoom}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                className="range w-24 min-w-0 cursor-pointer sm:w-36"
                aria-label="Preview zoom"
              />
              <span className="w-9 shrink-0 font-mono text-[10px] text-zinc-500">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(fitZoom(), false)}
                className="ml-auto shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-[3px] text-[10px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => applyZoom(1)}
                className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-[3px] text-[10px] text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                1:1
              </button>
            </div>

            <div
              ref={stageRef}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "rgba(168,85,247,.4)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "";
                if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
              }}
              className="min-h-0 flex-1 overflow-auto border border-transparent p-3"
            >
              <div
                className="grid justify-center"
                style={{
                  gridTemplateColumns: `repeat(${cols}, max-content)`,
                  columnGap: GRID_GAP,
                  rowGap: 20,
                  zoom: String(zoom),
                }}
              >
                {sheets.flatMap((photo, i) => [
                  <Sheet
                    key={`${photo?.id ?? "blank"}-front`}
                    isBack={false}
                    index={i}
                    photo={photo}
                    settings={settings}
                    showHoles={showHoles}
                    zoom={zoom}
                  />,
                  <Sheet
                    key={`${photo?.id ?? "blank"}-back`}
                    isBack
                    index={i}
                    photo={photo}
                    settings={settings}
                    showHoles={showHoles}
                    zoom={zoom}
                  />,
                ])}
              </div>
            </div>
          </motion.section>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
