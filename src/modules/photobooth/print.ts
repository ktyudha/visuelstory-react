/**
 * Cetak ke Epson TM-T20 (ESC/POS) lewat WebUSB, tanpa dialog cetak.
 * Perangkat cukup dipilih SEKALI (di pengaturan kiosk); setelah itu izin diingat browser
 * dan cetak berjalan diam-diam. Butuh Chrome/Edge (desktop atau Android). iOS/Safari tidak mendukung WebUSB.
 */
interface UsbEndpoint { endpointNumber: number; direction: "in" | "out"; type: string }
interface UsbDevice {
  vendorId: number; productName?: string; opened: boolean;
  configuration: { interfaces: { interfaceNumber: number; alternates: { endpoints: UsbEndpoint[] }[] }[] } | null;
  open(): Promise<void>; selectConfiguration(n: number): Promise<void>; claimInterface(n: number): Promise<void>;
  transferOut(ep: number, data: BufferSource): Promise<{ status: string }>;
}
type UsbApi = { getDevices(): Promise<UsbDevice[]>; requestDevice(o: { filters: { vendorId: number }[] }): Promise<UsbDevice> };
const usb = () => (navigator as unknown as { usb?: UsbApi }).usb;
const EPSON = 0x04b8;

export const printerSupported = () => !!usb();

let link: { dev: UsbDevice; ep: number } | null = null;

async function openLink(dev: UsbDevice) {
  if (link?.dev === dev) return link;
  if (!dev.opened) await dev.open();
  if (!dev.configuration) await dev.selectConfiguration(1);
  for (const i of dev.configuration!.interfaces)
    for (const a of i.alternates) {
      const ep = a.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
      if (ep) { await dev.claimInterface(i.interfaceNumber); return (link = { dev, ep: ep.endpointNumber }); }
    }
  throw new Error("Endpoint printer tidak ditemukan");
}

/** Harus dipanggil dari klik pengguna (aturan browser). */
export async function connectPrinter() {
  const dev = await usb()!.requestDevice({ filters: [{ vendorId: EPSON }] });
  await openLink(dev);
  return dev.productName || "Epson";
}

export async function printerName() {
  const dev = (await usb()?.getDevices())?.find((d) => d.vendorId === EPSON);
  return dev ? dev.productName || "Epson" : null;
}

/** Ubah ke 1-bit (hitam-putih) dengan dithering Floyd–Steinberg. Bit 1 = titik hitam. */
export function ditherToBits(canvas: HTMLCanvasElement) {
  const w = canvas.width, h = canvas.height;
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, w, h);
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    g[i] = Math.max(0, Math.min(255, (l - 128) * 1.2 + 128));
  }
  const wB = Math.ceil(w / 8), out = new Uint8Array(wB * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x, old = g[i], nw = old < 128 ? 0 : 255, err = old - nw;
      if (nw === 0) out[y * wB + (x >> 3)] |= 0x80 >> (x & 7);
      if (x + 1 < w) g[i + 1] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x > 0) g[i + w - 1] += (err * 3) / 16;
        g[i + w] += (err * 5) / 16;
        if (x + 1 < w) g[i + w + 1] += err / 16;
      }
    }
  return { bytes: out, wB, h };
}

/** Tampilan hasil cetak thermal (1-bit hitam-putih, titik-titik) sebagai canvas — untuk animasi/pratinjau. */
export function toThermalCanvas(src: HTMLCanvasElement) {
  const { bytes, wB, h } = ditherToBits(src);
  const out = document.createElement("canvas");
  out.width = src.width; out.height = h;
  const ctx = out.getContext("2d")!, img = ctx.createImageData(out.width, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < out.width; x++) {
    const black = bytes[y * wB + (x >> 3)] & (0x80 >> (x & 7)), o = (y * out.width + x) * 4, v = black ? 18 : 250;
    img.data[o] = v; img.data[o + 1] = v; img.data[o + 2] = v - (black ? 0 : 6); img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export function escposRaster(canvas: HTMLCanvasElement) {
  const { bytes, wB, h } = ditherToBits(canvas);
  const parts: number[][] = [[0x1b, 0x40]]; // ESC @ : reset
  const BAND = 128; // dipotong per pita agar buffer printer aman
  const body: Uint8Array[] = [];
  for (let y0 = 0; y0 < h; y0 += BAND) {
    const rows = Math.min(BAND, h - y0);
    body.push(new Uint8Array([0x1d, 0x76, 0x30, 0x00, wB & 255, wB >> 8, rows & 255, rows >> 8]), bytes.subarray(y0 * wB, (y0 + rows) * wB));
  }
  parts.push([0x1b, 0x64, 0x04], [0x1d, 0x56, 0x42, 0x00]); // feed 4 baris, potong kertas
  const chunks = [new Uint8Array(parts[0]), ...body, new Uint8Array(parts[1]), new Uint8Array(parts[2])];
  const all = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  return all;
}

export type PrintResult = "ok" | "no-printer" | "error";

/** Cetak tanpa UI. Tidak pernah melempar: kegagalan hanya dilaporkan lewat hasil. */
export async function printCanvas(canvas: HTMLCanvasElement): Promise<PrintResult> {
  try {
    const api = usb();
    if (!api) return "no-printer";
    const dev = (await api.getDevices()).find((d) => d.vendorId === EPSON);
    if (!dev) return "no-printer";
    const { dev: d, ep } = await openLink(dev);
    const data = escposRaster(canvas);
    for (let i = 0; i < data.length; i += 16384) await d.transferOut(ep, data.subarray(i, i + 16384));
    return "ok";
  } catch (e) {
    console.error("[photobooth] cetak gagal", e);
    link = null;
    return "error";
  }
}
