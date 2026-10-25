/**
 * Loose-leaf notebook paper generator.
 *
 * Everything here is pure browser-side: no server, no external PDF library.
 * Lines are emitted as vector strokes, the background photo is embedded as a
 * single JPEG XObject per sheet (shared by its front and back page).
 */

export type BackgroundFit = "cover" | "contain" | "fill";

export interface NotebookSettings {
  /** how the photo fills the page: cover = crop, contain = whole image, fill = stretch */
  fit: BackgroundFit;
  /** background photo */
  bgOp: number;
  bgBlur: number;
  bgSat: number;
  bgBri: number;
  bgCon: number;
  /** ruled lines */
  pitch: number;
  lnG: number;
  lw: number;
  padTop: number;
  padBottom: number;
  padLeft: number;
  padRight: number;
  sideLine: boolean;
  edgeLine: boolean;
}

export interface HLine {
  x1: number;
  x2: number;
  y: number;
  w: number;
  g: number;
}

export interface VLine {
  x: number;
  y1: number;
  y2: number;
  w: number;
  g: number;
}

export interface Geometry {
  lines: HLine[];
  vlines: VLine[];
}

export interface PdfPage {
  isBack: boolean;
  imgIdx: number;
}

export interface EmbeddedImage {
  bytes: Uint8Array;
  w: number;
  h: number;
}

export const PAGE_W_MM = 210;
export const PAGE_H_MM = 297;
/** A4 width in pt, 210mm exactly */
const PT_PER_MM = 595.2755905511812 / PAGE_W_MM;
const PAGE_W_PT = PAGE_W_MM * PT_PER_MM;
const PAGE_H_PT = PAGE_H_MM * PT_PER_MM;

const EPS = 1e-6;

/**
 * Line positions for one side of a sheet. The binding edge is a fixed physical
 * location, so the back side mirrors the left/right margins.
 */
export function lineGeometry(s: NotebookSettings, isBack: boolean): Geometry {
  const padIn = isBack ? s.padRight : s.padLeft;
  const padOut = isBack ? s.padLeft : s.padRight;
  const x1 = padIn;
  const x2 = PAGE_W_MM - padOut;
  const y0 = s.padTop;
  const yMax = PAGE_H_MM - s.padBottom;

  const g = Math.round(s.lnG);
  const edgeG = Math.max(72, g - 88);
  const edgeW = Math.min(0.7, Math.round(s.lw * 1.7 * 100) / 100);

  const ys: number[] = [];
  const steps = Math.floor((yMax - y0) / s.pitch + EPS);
  for (let i = 0; i <= steps; i++) {
    const y = y0 + i * s.pitch;
    if (y > yMax + EPS) break;
    ys.push(y);
  }

  const lines: HLine[] = ys.map((y, idx) => {
    const isEdge = s.edgeLine && (idx === 0 || idx === ys.length - 1);
    return {
      x1,
      x2,
      y,
      w: isEdge ? edgeW : s.lw,
      g: isEdge ? edgeG : g,
    };
  });

  const vlines: VLine[] = [];
  if (s.sideLine) {
    vlines.push({
      x: isBack ? PAGE_W_MM - s.padLeft : s.padLeft,
      y1: 0,
      y2: PAGE_H_MM,
      w: s.lw,
      g,
    });
  }

  return { lines, vlines };
}

function contentStream(
  s: NotebookSettings,
  isBack: boolean,
  imgName: string | null
): string {
  const geo = lineGeometry(s, isBack);
  const X = (v: number) => (v * PT_PER_MM).toFixed(3);
  const Y = (v: number) => ((PAGE_H_MM - v) * PT_PER_MM).toFixed(3);
  const out: string[] = [];

  if (imgName) {
    out.push("q");
    out.push(
      `${PAGE_W_PT.toFixed(3)} 0 0 ${PAGE_H_PT.toFixed(3)} 0 0 cm`
    );
    out.push(`/${imgName} Do`);
    out.push("Q");
  }

  out.push("q");
  for (const l of geo.lines) {
    const c = (l.g / 255).toFixed(4);
    out.push(`${(l.w * PT_PER_MM).toFixed(4)} w`);
    out.push(`${c} ${c} ${c} RG`);
    out.push(`${X(l.x1)} ${Y(l.y)} m ${X(l.x2)} ${Y(l.y)} l S`);
  }
  for (const l of geo.vlines) {
    const c = (l.g / 255).toFixed(4);
    out.push(`${(l.w * PT_PER_MM).toFixed(4)} w`);
    out.push(`${c} ${c} ${c} RG`);
    out.push(`${X(l.x)} ${Y(l.y1)} m ${X(l.x)} ${Y(l.y2)} l S`);
  }
  out.push("Q");

  return out.join("\n");
}

/**
 * Minimal PDF 1.4 writer.
 * Object ids: 1 = catalog, 2 = page tree, 10+ = images, 100+ = pages.
 */
export function buildPdf(
  pages: PdfPage[],
  imgs: EmbeddedImage[],
  s: NotebookSettings
): Blob {
  const enc = new TextEncoder();
  const parts: (string | Uint8Array)[] = [];
  let len = 0;
  const off: number[] = [];

  const put = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    len += bytes.length;
  };

  put("%PDF-1.4\n");
  put(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  off[1] = len;
  put("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const imgObjNo: number[] = [];
  imgs.forEach((im, i) => {
    const n = 10 + i;
    imgObjNo[i] = n;
    off[n] = len;
    put(
      `${n} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h}` +
        ` /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode` +
        ` /Length ${im.bytes.length} >>\nstream\n`
    );
    put(im.bytes);
    put("\nendstream\nendobj\n");
  });

  const kids: string[] = [];
  pages.forEach((p, i) => {
    const pn = 100 + i * 2;
    const cn = pn + 1;
    const hasImg = p.imgIdx >= 0 && imgObjNo[p.imgIdx] !== undefined;
    const name = hasImg ? `Im${p.imgIdx}` : null;
    const body = enc.encode(contentStream(s, p.isBack, name));

    off[pn] = len;
    put(
      `${pn} 0 obj\n<< /Type /Page /Parent 2 0 R` +
        ` /MediaBox [0 0 ${PAGE_W_PT.toFixed(3)} ${PAGE_H_PT.toFixed(3)}]`
    );
    if (hasImg) {
      put(
        ` /Resources << /XObject << /${name} ${imgObjNo[p.imgIdx]} 0 R >> >>`
      );
    }
    put(` /Contents ${cn} 0 R >>\nendobj\n`);

    off[cn] = len;
    put(`${cn} 0 obj\n<< /Length ${body.length} >>\nstream\n`);
    put(body);
    put("\nendstream\nendobj\n");

    kids.push(`${pn} 0 R`);
  });

  off[2] = len;
  put(
    `2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${kids.join(
      " "
    )}] >>\nendobj\n`
  );

  let maxObj = 2;
  for (let i = 0; i < off.length; i++) {
    if (off[i] !== undefined && i > maxObj) maxObj = i;
  }

  const xrefAt = len;
  let xref = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= maxObj; i++) {
    xref +=
      off[i] === undefined
        ? "0000000000 65535 f \n"
        : `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  }
  put(xref);
  put(
    `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`
  );

  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Flatten the photo onto white, then fade it, exactly like the preview does. */
export function renderBackground(
  img: HTMLImageElement,
  s: NotebookSettings,
  dpi: number
): EmbeddedImage {
  const pxPerMm = dpi / 25.4;
  const W = Math.round(PAGE_W_MM * pxPerMm);
  const H = Math.round(PAGE_H_MM * pxPerMm);
  // Same 4mm overscan as the preview, so blur never fades at the page edge.
  const OSC = Math.max(
    Math.round(4 * pxPerMm),
    Math.ceil(s.bgBlur * (dpi / 96) * 4)
  );

  const bw = W + OSC * 2;
  const bh = H + OSC * 2;

  const c1 = document.createElement("canvas");
  c1.width = bw;
  c1.height = bh;
  const g1 = c1.getContext("2d");
  if (!g1) {
    throw new Error("Canvas is not available in this browser");
  }
  g1.fillStyle = "#ffffff";
  g1.fillRect(0, 0, bw, bh);
  g1.filter =
    `blur(${(s.bgBlur * (dpi / 96)).toFixed(2)}px) ` +
    `saturate(${s.bgSat}%) brightness(${s.bgBri}%) contrast(${s.bgCon}%)`;

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  let dw: number;
  let dh: number;
  if (s.fit === "fill") {
    dw = bw;
    dh = bh;
  } else {
    // "contain" must fit the page itself, not the overscan area, otherwise the
    // sides get clipped by the bleed and the image is no longer complete.
    const scaleBy =
      s.fit === "contain"
        ? Math.min(W / iw, H / ih)
        : Math.max(bw / iw, bh / ih);
    dw = iw * scaleBy;
    dh = ih * scaleBy;
  }

  g1.drawImage(img, (bw - dw) / 2, (bh - dh) / 2, dw, dh);
  g1.filter = "none";

  const c2 = document.createElement("canvas");
  c2.width = W;
  c2.height = H;
  const g2 = c2.getContext("2d");
  if (!g2) {
    throw new Error("Canvas is not available in this browser");
  }
  g2.fillStyle = "#ffffff";
  g2.fillRect(0, 0, W, H);
  g2.globalAlpha = Math.max(0, Math.min(1, s.bgOp));
  g2.drawImage(c1, OSC, OSC, W, H, 0, 0, W, H);
  g2.globalAlpha = 1;

  c1.width = 1;
  c1.height = 1;

  const url = c2.toDataURL("image/jpeg", 0.9);
  c2.width = 1;
  c2.height = 1;

  return {
    bytes: b64ToBytes(url.slice(url.indexOf(",") + 1)),
    w: W,
    h: H,
  };
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read one of the images"));
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function fileStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}`
  );
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
