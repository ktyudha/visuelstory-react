import { GIFEncoder, applyPalette, quantize } from "gifenc";

export type ReelFormat = "video" | "gif";
export type Ratio = "9:16" | "1:1" | "16:9";

export interface ReelOptions {
  format: ReelFormat;
  ratio: Ratio;
  /** Lama tiap foto tampil (detik) */
  seconds: number;
  watermark: boolean;
  /** true = isi penuh bingkai (potong otomatis); false = foto utuh di atas latar blur */
  crop: boolean;
}

export interface ReelResult { blob: Blob; url: string; ext: "mp4" | "webm" | "gif"; mime: string }

/** Ukuran kanvas: video lebih besar, GIF dikecilkan agar file tidak raksasa. */
export const SIZES: Record<Ratio, { video: [number, number]; gif: [number, number] }> = {
  "9:16": { video: [720, 1280], gif: [360, 640] },
  "1:1": { video: [900, 900], gif: [480, 480] },
  "16:9": { video: [1280, 720], gif: [640, 360] },
};
/** Batas jumlah foto. Tanpa transisi, GIF hanya 1 frame per foto sehingga ukurannya kecil. */
export const maxPhotos = (_format: ReelFormat, _seconds: number) => 24; // eslint-disable-line @typescript-eslint/no-unused-vars

export class ReelCancelled extends Error { constructor() { super("cancelled"); } }

interface Ctl { cancelled: boolean }
const yieldUi = () => new Promise<void>((r) => setTimeout(r, 0));

/** Unduh foto sebagai bitmap (butuh header CORS dari API; gagal => pesan jelas). */
export async function loadBitmaps(urls: string[], onProgress: (done: number) => void, ctl: Ctl): Promise<ImageBitmap[]> {
  const out: ImageBitmap[] = new Array(urls.length);
  let done = 0, next = 0;
  const worker = async () => {
    while (next < urls.length) {
      if (ctl.cancelled) throw new ReelCancelled();
      const i = next++;
      let res: Response;
      try { res = await fetch(urls[i], { credentials: "omit" }); } catch { throw new Error("Foto tidak dapat diunduh. Periksa koneksi Anda lalu coba lagi."); }
      if (!res.ok) throw new Error("Link foto sudah kedaluwarsa. Muat ulang halaman lalu coba lagi.");
      out[i] = await createImageBitmap(await res.blob());
      onProgress(++done);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return out;
}

/** Titik fokus saat memotong: tengah horizontal; vertikal condong ke atas karena wajah biasanya di sepertiga atas foto potret. */
const FOCUS_X = 0.5;
const FOCUS_Y = 0.3;

/**
 * Gambar satu foto.
 *  - crop=true : isi PENUH bingkai (cover) dan potong kelebihannya mengikuti titik fokus.
 *  - crop=false: foto utuh di tengah dengan latar blur dari foto yang sama.
 */
function drawPhoto(ctx: CanvasRenderingContext2D, bmp: ImageBitmap, w: number, h: number, crop: boolean) {
  const cover = Math.max(w / bmp.width, h / bmp.height);

  if (crop) {
    const dw = bmp.width * cover, dh = bmp.height * cover;
    ctx.drawImage(bmp, -(dw - w) * FOCUS_X, -(dh - h) * FOCUS_Y, dw, dh);
    return;
  }

  const cs = cover * 1.15;
  ctx.save();
  if ("filter" in ctx) ctx.filter = `blur(${Math.round(w / 40)}px) brightness(0.65)`;
  ctx.drawImage(bmp, (w - bmp.width * cs) / 2, (h - bmp.height * cs) / 2, bmp.width * cs, bmp.height * cs);
  ctx.restore();
  const s = Math.min(w / bmp.width, h / bmp.height);
  ctx.drawImage(bmp, (w - bmp.width * s) / 2, (h - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
}

function drawWatermark(ctx: CanvasRenderingContext2D, logo: ImageBitmap | null, w: number, h: number) {
  if (!logo) return;
  const size = Math.round(Math.min(w, h) * 0.11);
  ctx.globalAlpha = 0.9;
  ctx.drawImage(logo, w - size - Math.round(size * 0.35), h - size - Math.round(size * 0.35), size, size);
  ctx.globalAlpha = 1;
}

/** Render pada detik `t`: foto ke-i tampil selama `seconds`, lalu langsung pindah ke foto berikutnya (tanpa transisi). */
function renderAt(ctx: CanvasRenderingContext2D, bmps: ImageBitmap[], logo: ImageBitmap | null, w: number, h: number, seconds: number, t: number, crop: boolean) {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
  drawPhoto(ctx, bmps[Math.min(bmps.length - 1, Math.floor(t / seconds))], w, h, crop);
  drawWatermark(ctx, logo, w, h);
}

const mimeCandidates = ["video/mp4;codecs=avc1.640028", "video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
export const pickVideoMime = () => (typeof MediaRecorder === "undefined" ? null : mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null);

/** Rekam video dari kanvas secara real-time (butuh tab tetap terbuka selama proses). */
export async function makeVideo(bmps: ImageBitmap[], logo: ImageBitmap | null, o: ReelOptions, onProgress: (p: number) => void, ctl: Ctl): Promise<ReelResult> {
  const mime = pickVideoMime();
  if (!mime) throw new Error("Browser ini belum mendukung pembuatan video. Gunakan format GIF, atau buka lewat Chrome/Safari terbaru.");
  const [w, h] = SIZES[o.ratio].video;
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const total = bmps.length * o.seconds;

  const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<void>((res) => { rec.onstop = () => res(); });

  renderAt(ctx, bmps, logo, w, h, o.seconds, 0, o.crop);
  rec.start(250);
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      if (ctl.cancelled) return resolve();
      const t = (performance.now() - t0) / 1000;
      renderAt(ctx, bmps, logo, w, h, o.seconds, Math.min(t, total - 0.001), o.crop);
      onProgress(Math.min(t / total, 1));
      if (t < total) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await stopped;
  if (ctl.cancelled) throw new ReelCancelled();

  const type = mime.split(";")[0];
  const blob = new Blob(chunks, { type });
  return { blob, url: URL.createObjectURL(blob), ext: type.includes("mp4") ? "mp4" : "webm", mime: type };
}

/** Susun GIF: 1 frame per foto, masing-masing tampil `seconds` detik. */
export async function makeGif(bmps: ImageBitmap[], logo: ImageBitmap | null, o: ReelOptions, onProgress: (p: number) => void, ctl: Ctl): Promise<ReelResult> {
  const [w, h] = SIZES[o.ratio].gif;
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const gif = GIFEncoder();
  const delay = Math.max(100, Math.round(o.seconds * 1000)); // GIF menyimpan per 10 ms; <20 ms dibulatkan browser

  for (let i = 0; i < bmps.length; i++) {
    if (ctl.cancelled) throw new ReelCancelled();
    renderAt(ctx, bmps, logo, w, h, o.seconds, i * o.seconds, o.crop);
    const { data } = ctx.getImageData(0, 0, w, h);
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay, repeat: 0 });
    onProgress((i + 1) / bmps.length);
    await yieldUi(); // biarkan UI (progress) bernapas
  }
  gif.finish();
  const blob = new Blob([gif.bytes() as BlobPart], { type: "image/gif" });
  return { blob, url: URL.createObjectURL(blob), ext: "gif", mime: "image/gif" };
}

export async function loadLogo(src: string): Promise<ImageBitmap | null> {
  try { return await createImageBitmap(await (await fetch(src)).blob()); } catch { return null; }
}
