import { GIFEncoder, applyPalette, quantize } from "gifenc";

/** Semua foto hanya hidup di memori browser (tidak diunggah, tidak disimpan). */
export type Photo = { id: string; name: string; thumb: string; bmp: ImageBitmap };

const MAX_EDGE = 1600; // batasi ukuran agar memori HP aman

export async function loadPhoto(file: File): Promise<Photo> {
  const full = await createImageBitmap(file);
  const k = Math.min(1, MAX_EDGE / Math.max(full.width, full.height));
  let bmp = full;
  if (k < 1) {
    bmp = await createImageBitmap(full, { resizeWidth: Math.round(full.width * k), resizeHeight: Math.round(full.height * k), resizeQuality: "high" });
    full.close();
  }
  return { id: crypto.randomUUID(), name: file.name, thumb: URL.createObjectURL(file), bmp };
}

export function disposePhoto(p: Photo) {
  URL.revokeObjectURL(p.thumb);
  p.bmp.close();
}

/** Posisi & zoom per foto: x,y di [-1,1] (geser dalam area lebih), z >= 1. */
export type Adj = { z: number; x: number; y: number };
export const DEFAULT_ADJ: Adj = { z: 1, x: 0, y: 0 };
export type Style = { adjs?: Record<string, Adj>; filter?: string };

export const FILTERS = [
  { id: "none", label: "Asli", css: "none" },
  { id: "warm", label: "Hangat", css: "sepia(.25) saturate(1.2) brightness(1.03)" },
  { id: "cool", label: "Dingin", css: "contrast(1.05) saturate(.95) hue-rotate(10deg)" },
  { id: "vivid", label: "Cerah", css: "saturate(1.5) contrast(1.08)" },
  { id: "fade", label: "Pudar", css: "contrast(.85) brightness(1.1) saturate(.8)" },
  { id: "cine", label: "Sinema", css: "contrast(1.2) saturate(.85) sepia(.15) brightness(.95)" },
  { id: "bw", label: "Hitam putih", css: "grayscale(1) contrast(1.1)" },
];
export const filterSupported = () => typeof CanvasRenderingContext2D !== "undefined" && "filter" in CanvasRenderingContext2D.prototype;

/** Seberapa jauh foto bisa digeser di dalam kotak (px) pada zoom tertentu. */
export function overflow(img: ImageBitmap, w: number, h: number, z: number) {
  const s = Math.max(w / img.width, h / img.height) * z;
  return { ox: Math.max(0, img.width * s - w), oy: Math.max(0, img.height * s - h) };
}

function cover(ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, y: number, w: number, h: number, kb = 1, adj: Adj = DEFAULT_ADJ, fx = "none") {
  const s = Math.max(w / img.width, h / img.height) * adj.z * kb;
  const dw = img.width * s, dh = img.height * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = fx;
  ctx.drawImage(img, x + (w - dw) / 2 + (adj.x * (dw - w)) / 2, y + (h - dh) / 2 + (adj.y * (dh - h)) / 2, dw, dh);
  ctx.restore();
}

export function drawStill(ctx: CanvasRenderingContext2D, p: Photo, st: Style) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  cover(ctx, p.bmp, 0, 0, ctx.canvas.width, ctx.canvas.height, 1, st.adjs?.[p.id], st.filter);
}

export function avgColor(bmp: ImageBitmap) {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ---------- Grid ---------- */

type Cell = [col: number, row: number, colSpan: number, rowSpan: number];
export type GridLayout = { id: string; label: string; cols: number; rows: number; ratio: number; cells: Cell[] };

const fill = (cols: number, rows: number): Cell[] => Array.from({ length: cols * rows }, (_, i) => [i % cols, Math.floor(i / cols), 1, 1]);

export const GRID_LAYOUTS: GridLayout[] = [
  // 2 foto
  { id: "2h", label: "2 berdampingan", cols: 2, rows: 1, ratio: 0.7, cells: fill(2, 1) },
  { id: "2v", label: "2 atas-bawah", cols: 1, rows: 2, ratio: 1.4, cells: fill(1, 2) },
  // 3 foto
  { id: "3a", label: "1 besar + 2", cols: 2, rows: 2, ratio: 1, cells: [[0, 0, 1, 2], [1, 0, 1, 1], [1, 1, 1, 1]] },
  { id: "3b", label: "1 atas + 2", cols: 2, rows: 2, ratio: 1, cells: [[0, 0, 2, 1], [0, 1, 1, 1], [1, 1, 1, 1]] },
  { id: "3c", label: "3 kolom", cols: 3, rows: 1, ratio: 0.55, cells: fill(3, 1) },
  { id: "3d", label: "3 baris", cols: 1, rows: 3, ratio: 2, cells: fill(1, 3) },
  // 4 foto
  { id: "2x2", label: "2 × 2", cols: 2, rows: 2, ratio: 1, cells: fill(2, 2) },
  { id: "4a", label: "1 besar + 3", cols: 3, rows: 3, ratio: 1, cells: [[0, 0, 3, 2], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1]] },
  { id: "4b", label: "1 kiri + 3", cols: 2, rows: 3, ratio: 1.2, cells: [[0, 0, 1, 3], [1, 0, 1, 1], [1, 1, 1, 1], [1, 2, 1, 1]] },
  { id: "strip", label: "Photo strip", cols: 1, rows: 4, ratio: 3.2, cells: fill(1, 4) },
  // 5 foto
  { id: "5a", label: "1 besar + 4", cols: 2, rows: 4, ratio: 2, cells: [[0, 0, 2, 2], [0, 2, 1, 1], [1, 2, 1, 1], [0, 3, 1, 1], [1, 3, 1, 1]] },
  // 6 foto
  { id: "6a", label: "2 × 3", cols: 2, rows: 3, ratio: 1.5, cells: fill(2, 3) },
  { id: "6b", label: "3 × 2", cols: 3, rows: 2, ratio: 0.67, cells: fill(3, 2) },
  // 9 foto
  { id: "3x3", label: "3 × 3", cols: 3, rows: 3, ratio: 1, cells: fill(3, 3) },
];

export const GRID_W = 1080;

export type CellRect = { pid: string; x: number; y: number; w: number; h: number };

export function renderGrid(canvas: HTMLCanvasElement, photos: Photo[], layout: GridLayout, gap: number, bg: string, radius: number, st: Style = {}, selected?: string | null): CellRect[] {
  const W = GRID_W, H = Math.round(W * layout.ratio);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const rects: CellRect[] = [];
  if (!photos.length) return rects;
  const cw = (W - gap * (layout.cols + 1)) / layout.cols;
  const ch = (H - gap * (layout.rows + 1)) / layout.rows;
  layout.cells.forEach(([c, r, cs, rs], i) => {
    const x = gap + c * (cw + gap), y = gap + r * (ch + gap);
    const w = cw * cs + gap * (cs - 1), h = ch * rs + gap * (rs - 1);
    const ph = photos[i % photos.length]; // foto kurang dari kotak -> diulang
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
    cover(ctx, ph.bmp, x, y, w, h, 1, st.adjs?.[ph.id], st.filter);
    ctx.restore();
    rects.push({ pid: ph.id, x, y, w, h });
  });
  if (selected) {
    ctx.lineWidth = 8; ctx.strokeStyle = "#d4af37";
    rects.filter((r) => r.pid === selected).forEach((r) => { ctx.beginPath(); ctx.roundRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8, Math.max(0, radius - 4)); ctx.stroke(); });
  }
  return rects;
}

/* ---------- Slideshow (GIF & video) ---------- */

export type Ratio = { id: string; label: string; hint: string; w: number; h: number };
export const RATIOS: Ratio[] = [
  { id: "1:1", label: "1:1", hint: "feed", w: 720, h: 720 },
  { id: "4:5", label: "4:5", hint: "Instagram", w: 720, h: 900 },
  { id: "9:16", label: "9:16", hint: "Story/Reels", w: 540, h: 960 },
  { id: "16:9", label: "16:9", hint: "YouTube", w: 960, h: 540 },
];

export type SlideOpts = Style & { seconds: number; fade: number; zoom: boolean };

/** Gambar tampilan slideshow pada detik ke-t. */
export function drawSlide(ctx: CanvasRenderingContext2D, photos: Photo[], t: number, o: SlideOpts): number {
  const { width: W, height: H } = ctx.canvas;
  const n = photos.length;
  const i = Math.min(n - 1, Math.floor(t / o.seconds));
  const local = t - i * o.seconds;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  cover(ctx, photos[i].bmp, 0, 0, W, H, o.zoom ? 1 + 0.06 * (local / o.seconds) : 1, o.adjs?.[photos[i].id], o.filter);
  const left = o.seconds - local;
  if (o.fade > 0 && i < n - 1 && left < o.fade) {
    ctx.globalAlpha = 1 - left / o.fade;
    cover(ctx, photos[i + 1].bmp, 0, 0, W, H, 1, o.adjs?.[photos[i + 1].id], o.filter);
    ctx.globalAlpha = 1;
  }
  return i;
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function makeGif(photos: Photo[], ratio: Ratio, o: SlideOpts, onProgress: (p: number) => void): Promise<Blob> {
  const scale = 0.67; // GIF besar cepat membengkak
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(ratio.w * scale); canvas.height = Math.round(ratio.h * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const gif = GIFEncoder();
  const STEP = 0.12; // detik per frame saat transisi
  // daftar waktu frame: satu frame tahan per foto + beberapa frame saat fade
  const times: { t: number; delay: number }[] = [];
  photos.forEach((_, i) => {
    const start = i * o.seconds;
    const hold = i < photos.length - 1 && o.fade > 0 ? o.seconds - o.fade : o.seconds;
    times.push({ t: start, delay: hold * 1000 });
    if (i < photos.length - 1 && o.fade > 0)
      for (let s = start + hold; s < start + o.seconds - 1e-6; s += STEP) times.push({ t: s, delay: STEP * 1000 });
  });
  for (let k = 0; k < times.length; k++) {
    drawSlide(ctx, photos, times[k].t, { ...o, zoom: false });
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), canvas.width, canvas.height, { palette, delay: Math.round(times[k].delay) });
    onProgress((k + 1) / times.length);
    await tick();
  }
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
}

export function pickVideoMime() {
  const list = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return typeof MediaRecorder === "undefined" ? undefined : list.find((m) => MediaRecorder.isTypeSupported(m));
}

export async function makeVideo(photos: Photo[], ratio: Ratio, o: SlideOpts, onProgress: (p: number) => void): Promise<Blob> {
  const mime = pickVideoMime();
  if (!mime) throw new Error("Browser ini belum mendukung perekaman video.");
  const canvas = document.createElement("canvas");
  canvas.width = ratio.w; canvas.height = ratio.h;
  const ctx = canvas.getContext("2d")!;
  const total = photos.length * o.seconds;
  const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((res, rej) => {
    rec.onstop = () => res(new Blob(chunks, { type: mime.split(";")[0] }));
    rec.onerror = () => rej(new Error("Perekaman gagal."));
  });
  drawSlide(ctx, photos, 0, o);
  rec.start();
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      if (t >= total) return resolve();
      drawSlide(ctx, photos, t, o);
      onProgress(t / total);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  drawSlide(ctx, photos, total - 0.001, o);
  await tick();
  rec.stop();
  return done;
}
