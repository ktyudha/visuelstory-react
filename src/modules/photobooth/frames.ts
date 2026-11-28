/**
 * Frame Receipt Photobooth. Tiap frame = fungsi `build` yang menentukan tinggi kertas, posisi foto,
 * dan dekorasi. Dua palet: warna (soft file) dan mono (cetak thermal, hitam-putih).
 * Lebar kertas TM-T20 80 mm = 576 titik.
 */
export const PAPER_W = 576;

type Ctx = CanvasRenderingContext2D;
export type Meta = { brand: string; title: string; subtitle: string; handle: string; when: string; date: string; code: string };
export type Pal = { bg: string; ink: string; a: string; b: string; c: string; mono: boolean };
export type Slot = { x: number; y: number; w: number; h: number; r?: number; rot?: number; border?: { w: number; color: string; extra?: number } };
type Built = { H: number; slots: Slot[]; under: (c: Ctx) => void; over?: (c: Ctx) => void };
export type Era = "sig" | "dulu" | "kini";
export type Frame = { id: string; name: string; blurb: string; era: Era; count: number; pal: Pal; build: (W: number, p: Pal, m: Meta) => Built };

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"Courier New", Courier, monospace';
const HAND = '"Bradley Hand", "Segoe Script", "Marker Felt", "Comic Sans MS", cursive';
const ROUND = '"Arial Rounded MT Bold", "Arial Black", Impact, sans-serif';
const MONO_PAL: Pal = { bg: "#fff", ink: "#000", a: "#000", b: "#fff", c: "#d8d8d8", mono: true };

/* ---------- helper gambar ---------- */
function text(c: Ctx, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", ls = 0) {
  c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  (c as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
  c.fillText(t, x, y);
  (c as unknown as { letterSpacing: string }).letterSpacing = "0px";
}
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
function dash(c: Ctx, x1: number, x2: number, y: number, s: number, color: string) {
  c.save(); c.setLineDash([9 * s, 7 * s]); c.lineWidth = 2 * s; c.strokeStyle = color; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); c.restore();
}
function sparkle(c: Ctx, x: number, y: number, r: number, color: string) {
  c.fillStyle = color; c.beginPath(); c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill();
}
function heart(c: Ctx, x: number, y: number, r: number, color: string) {
  c.fillStyle = color; c.beginPath(); c.moveTo(x, y + r * 0.9);
  c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45);
  c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill();
}
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0) % 1000) / 1000;
}
function barcode(c: Ctx, cx: number, y: number, w: number, h: number, s: number, code: string, color: string) {
  const rnd = seeded(code); let x = cx - w / 2;
  c.fillStyle = color;
  while (x < cx + w / 2) { const bw = (1 + Math.floor(rnd() * 4)) * 2 * s; if (rnd() > 0.38) c.fillRect(x, y, bw, h); x += bw + (1 + Math.floor(rnd() * 2)) * 2 * s; }
}

/* ---------- helper nota ---------- */
const row = (c: Ctx, l: string, r: string, y: number, x1: number, x2: number, font: string, color: string) => { text(c, l, x1, y, font, color, "left"); text(c, r, x2, y, font, color, "right"); };
/** Kertas dengan tepi sobekan (zig-zag) di atas dan bawah, di atas "meja". Versi mono: tanpa meja, hanya garis tepi. */
function zigPaper(c: Ctx, W: number, H: number, s: number, p: Pal, paper: string) {
  const m = 14 * s, t = 11 * s;
  c.fillStyle = p.mono ? "#fff" : p.c; c.fillRect(0, 0, W, H);
  c.save();
  if (!p.mono) { c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 10 * s; c.shadowOffsetY = 3 * s; }
  c.beginPath(); c.moveTo(m, t);
  for (let x = m; x < W - m - t; x += t * 2) { c.lineTo(x + t, 0); c.lineTo(x + t * 2, t); }
  c.lineTo(W - m, H - t);
  for (let x = W - m; x > m + t; x -= t * 2) { c.lineTo(x - t, H); c.lineTo(x - t * 2, H - t); }
  c.closePath(); c.fillStyle = paper; c.fill(); c.restore();
  if (p.mono) { c.lineWidth = 2 * s; c.strokeStyle = "#000"; c.stroke(); }
}
function stamp(c: Ctx, label: string, x: number, y: number, s: number, rot: number, color: string, size = 54) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.font = `900 ${size * s}px ${ROUND}`; (c as unknown as { letterSpacing: string }).letterSpacing = `${4 * s}px`;
  const w = c.measureText(label).width + 36 * s, h = size * s + 26 * s;
  c.strokeStyle = color; c.lineWidth = 6 * s; rr(c, -w / 2, -h / 2, w, h, 12 * s); c.stroke();
  c.lineWidth = 2 * s; rr(c, -w / 2 + 9 * s, -h / 2 + 9 * s, w - 18 * s, h - 18 * s, 8 * s); c.stroke();
  c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, 0, 2 * s); c.restore();
}
const stackSlots = (n: number, x: number, y: number, w: number, ratio: number, gap: number, extra: Partial<Slot> = {}): Slot[] =>
  Array.from({ length: n }, (_, i) => ({ x, y: y + i * (w / ratio + gap), w, h: w / ratio, ...extra }));
const stackH = (n: number, w: number, ratio: number, gap: number) => n * (w / ratio) + (n - 1) * gap;
const R = [0, 1.0, 1.25, 1.45]; // rasio foto per jumlah foto (1..3)
const ITEM = (k: number) => `Foto kenangan #${k}`;

/* ---------- Frame (semuanya bergaya nota / struk; 1-3 foto) ---------- */
const receipt = (n: number): Frame => ({
  id: `receipt-${n}`, name: "Struk Kasir", blurb: "Struk khas Visuelstory", era: "sig", count: n,
  pal: { bg: "#ffffff", ink: "#111111", a: "#111111", b: "#ffffff", c: "#e2ddd3", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, px = 46 * s, ix2 = W - px, iw = W - px * 2, gap = 14 * s, top = 246 * s, d = (3 - n) * 30;
    const slots = stackSlots(n, px, top, iw, R[n], gap), gh = stackH(n, iw, R[n], gap), fy = top + gh + 34 * s, H = Math.round(fy + (400 - d) * s);
    return {
      H, slots,
      under: (c) => {
        zigPaper(c, W, H, s, p, p.bg);
        text(c, m.brand, W / 2, 84 * s, `italic 700 ${60 * s}px ${SERIF}`, p.ink);
        text(c, "RECEIPT PHOTOBOOTH", W / 2 + 4 * s, 118 * s, `600 ${18 * s}px ${SANS}`, p.ink, "center", 7 * s);
        dash(c, px, ix2, 142 * s, s, p.ink);
        row(c, "Kasir : Visuelstory", "Meja 01", 176 * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        row(c, m.when, `#${m.code}`, 204 * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        dash(c, px, ix2, 226 * s, s, p.ink);
        dash(c, px, ix2, fy, s, p.ink);
        for (let k = 1; k <= n; k++) row(c, `1x  ${ITEM(k)}`, "Rp 0", fy + 40 * s + (k - 1) * 30 * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        dash(c, px, ix2, fy + (146 - d) * s, s, p.ink);
        row(c, "TOTAL", "PRICELESS", fy + (192 - d) * s, px, ix2, `800 ${26 * s}px ${MONO}`, p.ink);
        row(c, "BAYAR", "SENYUM", fy + (226 - d) * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        barcode(c, W / 2, fy + (252 - d) * s, iw * 0.72, 56 * s, s, m.code, p.ink);
        text(c, "TERIMA KASIH", W / 2 + 3 * s, fy + (340 - d) * s, `700 ${18 * s}px ${SANS}`, p.ink, "center", 6 * s);
        if (m.handle) text(c, m.handle, W / 2, fy + (366 - d) * s, `${16 * s}px ${MONO}`, p.ink);
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 2 * s; slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

const notaWarung = (n: number): Frame => ({
  id: `nota-${n}`, name: "Nota Warung", blurb: "Nota tulis tangan jadul", era: "dulu", count: n,
  pal: { bg: "#f8f1dc", ink: "#1a1a1a", a: "#a98432", b: "#e3c777", c: "#d9ccaa", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, px = 46 * s, ix2 = W - px, iw = W - px * 2, gap = 14 * s, top = 262 * s, d = (3 - n) * 34;
    const slots = stackSlots(n, px, top, iw, R[n], gap), gh = stackH(n, iw, R[n], gap), fy = top + gh + 30 * s, H = Math.round(fy + (352 - d) * s);
    return {
      H, slots,
      under: (c) => {
        zigPaper(c, W, H, s, p, p.mono ? "#fff" : p.bg);
        if (!p.mono) { c.strokeStyle = p.b; c.lineWidth = 1.5 * s; for (let y = 40 * s; y < H - 20 * s; y += 34 * s) { c.beginPath(); c.moveTo(24 * s, y); c.lineTo(W - 24 * s, y); c.stroke(); } }
        c.strokeStyle = p.mono ? "#000" : p.a; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(34 * s, 20 * s); c.lineTo(34 * s, H - 20 * s); c.stroke();
        text(c, "N O T A", W / 2, 96 * s, `800 ${66 * s}px ${SERIF}`, p.ink);
        text(c, `${m.brand}  ·  Receipt Photobooth`, W / 2, 132 * s, `${20 * s}px ${HAND}`, p.ink);
        c.fillStyle = p.ink; c.fillRect(px, 150 * s, iw, 4 * s); c.fillRect(px, 158 * s, iw, 1.5 * s);
        row(c, `No. ${m.code}`, `Tgl. ${m.date}`, 192 * s, px, ix2, `${24 * s}px ${HAND}`, p.ink);
        text(c, "Kepada Yth.  :  Kamu", px, 232 * s, `${26 * s}px ${HAND}`, p.ink, "left");
        for (let k = 1; k <= n; k++) row(c, `${k}   Foto kenangan`, "Rp 0", fy + 36 * s + (k - 1) * 34 * s, px, ix2, `${25 * s}px ${HAND}`, p.ink);
        c.fillStyle = p.ink; c.fillRect(px, fy + (150 - d) * s, iw, 2 * s);
        row(c, "JUMLAH", "Rp 0,-", fy + (190 - d) * s, px, ix2, `800 ${28 * s}px ${HAND}`, p.ink);
        text(c, "(nol rupiah, bonus senyum)", px, fy + (222 - d) * s, `${20 * s}px ${HAND}`, p.ink, "left");
        text(c, "Hormat kami,", W - px - 30 * s, fy + (262 - d) * s, `${22 * s}px ${HAND}`, p.ink, "right");
        text(c, m.brand, W - px - 20 * s, fy + (306 - d) * s, `italic ${46 * s}px ${HAND}`, p.ink, "right");
        stamp(c, "LUNAS", px + 112 * s, fy + (292 - d) * s, s, -0.2, p.mono ? "#000" : p.a, 40);
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 3 * s; slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

const tiket = (n: number): Frame => ({
  id: `tiket-${n}`, name: "Tiket Bioskop", blurb: "Karcis nonton tempo dulu", era: "dulu", count: n,
  pal: { bg: "#d4b05a", ink: "#171717", a: "#171717", b: "#f3e8c9", c: "#171717", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, mg = 16 * s, px = 56 * s, iw = W - px * 2, gap = 14 * s, top = 300 * s;
    const slots = stackSlots(n, px, top, iw, R[n] + 0.15, gap), gh = stackH(n, iw, R[n] + 0.15, gap), perf = top + gh + 44 * s, H = Math.round(perf + 300 * s);
    return {
      H, slots,
      under: (c) => {
        c.fillStyle = p.mono ? "#fff" : p.c; c.fillRect(0, 0, W, H);
        rr(c, mg, mg, W - mg * 2, H - mg * 2, 22 * s); c.fillStyle = p.mono ? "#fff" : p.bg; c.fill();
        c.lineWidth = (p.mono ? 3 : 0) * s; c.strokeStyle = "#000"; if (p.mono) c.stroke();
        [mg, W - mg].forEach((x) => { c.beginPath(); c.arc(x, perf, 20 * s, 0, 7); c.fillStyle = p.mono ? "#fff" : p.c; c.fill(); if (p.mono) { c.lineWidth = 3 * s; c.stroke(); } });
        text(c, "ADMIT ONE", W / 2, 118 * s, `900 ${70 * s}px ${ROUND}`, p.ink, "center", 5 * s);
        [44, W / s - 44].forEach((x) => sparkle(c, x * s, 96 * s, 14 * s, p.ink));
        text(c, "RECEIPT PHOTOBOOTH PRESENTS", W / 2 + 3 * s, 158 * s, `700 ${17 * s}px ${SANS}`, p.ink, "center", 5 * s);
        c.fillStyle = p.ink; c.fillRect(px, 178 * s, iw, 4 * s); c.fillRect(px, 188 * s, iw, 1.5 * s);
        text(c, (m.title || "The Moment").toUpperCase(), W / 2, 248 * s, `italic 800 ${48 * s}px ${SERIF}`, p.ink);
        text(c, `${m.brand}  ·  ${m.date}`, W / 2, 282 * s, `${19 * s}px ${MONO}`, p.ink);
        dash(c, mg + 20 * s, W - mg - 20 * s, perf, s, p.ink);
        text(c, "ROW  A     SEAT  07", W / 2, perf + 62 * s, `900 ${38 * s}px ${ROUND}`, p.ink, "center", 3 * s);
        text(c, `${m.when}`, W / 2, perf + 98 * s, `${20 * s}px ${MONO}`, p.ink);
        barcode(c, W / 2, perf + 122 * s, iw * 0.7, 62 * s, s, m.code, p.ink);
        text(c, `NO. ${m.code}`, W / 2, perf + 222 * s, `700 ${20 * s}px ${MONO}`, p.ink, "center", 4 * s);
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 5 * s; slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

const dotMatrix = (n: number): Frame => ({
  id: `dotmatrix-${n}`, name: "Dot Matrix", blurb: "Kertas komputer lubang-lubang", era: "dulu", count: n,
  pal: { bg: "#fbf7ec", ink: "#1a1a1a", a: "#f3e8c9", b: "#e3c777", c: "#d9d4c7", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, tr = 54 * s, px = tr + 26 * s, iw = W - px * 2, gap = 14 * s, top = 230 * s, d = (3 - n) * 28;
    const slots = stackSlots(n, px, top, iw, R[n], gap), gh = stackH(n, iw, R[n], gap), fy = top + gh + 30 * s, H = Math.round(fy + (290 - d) * s);
    const f = (sz: number, w = 400) => `${w} ${sz * s}px ${MONO}`;
    return {
      H, slots,
      under: (c) => {
        c.fillStyle = p.mono ? "#fff" : p.bg; c.fillRect(0, 0, W, H);
        if (!p.mono) { for (let y = 0, i = 0; y < H; y += 56 * s, i++) { if (i % 2) { c.fillStyle = p.a; c.fillRect(tr, y, W - tr * 2, 56 * s); } } c.fillStyle = p.b; c.fillRect(0, 0, tr, H); c.fillRect(W - tr, 0, tr, H); }
        for (let y = 26 * s; y < H; y += 52 * s) [tr / 2, W - tr / 2].forEach((x) => { c.beginPath(); c.arc(x, y, 9 * s, 0, 7); c.fillStyle = p.mono ? "#000" : p.c; c.fill(); });
        [tr, W - tr].forEach((x) => { c.save(); c.setLineDash([3 * s, 5 * s]); c.strokeStyle = p.ink; c.lineWidth = 1.5 * s; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); c.restore(); });
        const bar = "=".repeat(Math.floor(iw / (11.5 * s)));
        text(c, "*** RECEIPT PHOTOBOOTH ***", W / 2, 80 * s, f(23, 700), p.ink);
        text(c, m.brand.toUpperCase(), W / 2, 124 * s, f(42, 700), p.ink, "center", 3 * s);
        text(c, bar, W / 2, 152 * s, f(20), p.ink);
        row(c, `TRX#${m.code}`, m.date, 184 * s, px, W - px, f(19), p.ink);
        row(c, "KASIR:01", m.when.slice(-5), 210 * s, px, W - px, f(19), p.ink);
        for (let k = 1; k <= n; k++) row(c, `FOTO-0${k} ${".".repeat(8)}`, "0.00", fy + 36 * s + (k - 1) * 28 * s, px, W - px, f(19), p.ink);
        text(c, bar, W / 2, fy + (138 - d) * s, f(20), p.ink);
        row(c, "TOTAL", "PRICELESS", fy + (176 - d) * s, px, W - px, f(26, 700), p.ink);
        text(c, bar, W / 2, fy + (206 - d) * s, f(20), p.ink);
        text(c, "*** TERIMA KASIH ***", W / 2, fy + (246 - d) * s, f(21, 700), p.ink);
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 3 * s; slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

/** Tata letak 1-3 foto untuk desain bergrid: 1 besar / 2 berdampingan / 1 besar + 2 kecil. */
function gridSlots(n: number, x: number, y: number, iw: number, gap: number, ratios: [number, number, number], extra: Partial<Slot> = {}) {
  if (n === 1) { const h = iw / ratios[0]; return { slots: [{ x, y, w: iw, h, ...extra }] as Slot[], h }; }
  const cw = (iw - gap) / 2;
  if (n === 2) { const h = cw / 0.9; return { slots: [0, 1].map((i) => ({ x: x + i * (cw + gap), y, w: cw, h, ...extra })) as Slot[], h }; }
  const h1 = iw / ratios[1], h2 = cw / ratios[2];
  return { slots: [{ x, y, w: iw, h: h1, ...extra }, { x, y: y + h1 + gap, w: cw, h: h2, ...extra }, { x: x + cw + gap, y: y + h1 + gap, w: cw, h: h2, ...extra }] as Slot[], h: h1 + gap + h2 };
}

const cafe = (n: number): Frame => ({
  id: `cafe-${n}`, name: "Cafe Receipt", blurb: "Struk kafe aesthetic", era: "kini", count: n,
  pal: { bg: "#fbf7ec", ink: "#1a1a1a", a: "#a98432", b: "#f3e8c9", c: "#e6e0d0", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, px = 46 * s, ix2 = W - px, iw = W - px * 2, gap = 14 * s, top = 236 * s;
    const g = gridSlots(n, px, top, iw, gap, [1, 1.5, 1], { r: 20 * s });
    const fy = top + g.h + 34 * s, H = Math.round(fy + 420 * s);
    return {
      H, slots: g.slots,
      under: (c) => {
        zigPaper(c, W, H, s, p, p.bg);
        text(c, m.brand.toLowerCase(), W / 2, 92 * s, `italic 600 ${58 * s}px ${SERIF}`, p.ink);
        text(c, "receipt photobooth", W / 2, 126 * s, `${22 * s}px ${HAND}`, p.mono ? p.ink : p.a);
        dash(c, px, ix2, 152 * s, s, p.ink);
        row(c, `ORDER #${m.code}`, "DINE IN", 184 * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        row(c, m.date, m.when.slice(-5), 210 * s, px, ix2, `${19 * s}px ${MONO}`, p.ink);
        dash(c, px, ix2, fy, s, p.ink);
        [["1  Iced Matcha Latte", "0"], ["1  Butter Croissant", "0"], ["4  Good Vibes", "0"]].forEach(([l, r], i) => row(c, l, r, fy + 40 * s + i * 32 * s, px, ix2, `${20 * s}px ${MONO}`, p.ink));
        dash(c, px, ix2, fy + 142 * s, s, p.ink);
        row(c, "TOTAL", "priceless", fy + 184 * s, px, ix2, `700 ${26 * s}px ${SERIF}`, p.ink);
        text(c, "thank you, see you again!", W / 2, fy + 244 * s, `${32 * s}px ${HAND}`, p.ink);
        heart(c, W / 2, fy + 280 * s, 11 * s, p.mono ? p.ink : "#c9a24a");
        barcode(c, W / 2, fy + 308 * s, iw * 0.5, 40 * s, s * 0.8, m.code, p.ink);
        if (m.handle) text(c, m.handle, W / 2, fy + 382 * s, `${16 * s}px ${MONO}`, p.ink);
      },
    };
  },
});

const boarding = (n: number): Frame => ({
  id: `boarding-${n}`, name: "Boarding Pass", blurb: "Tiket terbang ke kenangan", era: "kini", count: n,
  pal: { bg: "#ffffff", ink: "#171717", a: "#e3c777", b: "#f3e8c9", c: "#e9e4d6", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, mg = 16 * s, px = 46 * s, ix2 = W - px, iw = W - px * 2, gap = 14 * s, top = 392 * s;
    const slots = stackSlots(n, px, top, iw, R[n] + 0.05, gap, { r: 16 * s }), gh = stackH(n, iw, R[n] + 0.05, gap), perf = top + gh + 40 * s, H = Math.round(perf + 290 * s);
    return {
      H, slots,
      under: (c) => {
        c.fillStyle = p.mono ? "#fff" : p.c; c.fillRect(0, 0, W, H);
        rr(c, mg, mg, W - mg * 2, H - mg * 2, 26 * s); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 3 * s; c.strokeStyle = "#000"; if (p.mono) c.stroke();
        c.save(); rr(c, mg, mg, W - mg * 2, 150 * s, 26 * s); c.clip();
        if (p.mono) { c.fillStyle = "#000"; c.fillRect(mg, mg, W, 150 * s); } else { const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, p.a); g.addColorStop(1, p.b); c.fillStyle = g; c.fillRect(mg, mg, W, 150 * s); }
        c.restore();
        const hc = p.mono ? "#fff" : p.ink;
        text(c, "BOARDING PASS", W / 2, 84 * s, `900 ${42 * s}px ${ROUND}`, hc, "center", 4 * s);
        text(c, "RECEIPT PHOTOBOOTH", W / 2 + 3 * s, 124 * s, `700 ${16 * s}px ${SANS}`, hc, "center", 6 * s);
        text(c, "FROM", px, 204 * s, `700 ${14 * s}px ${SANS}`, p.ink, "left", 3 * s); text(c, "TO", ix2, 204 * s, `700 ${14 * s}px ${SANS}`, p.ink, "right", 3 * s);
        text(c, "BEGIN", px, 252 * s, `900 ${52 * s}px ${ROUND}`, p.ink, "left"); text(c, "MEMO", ix2, 252 * s, `900 ${52 * s}px ${ROUND}`, p.ink, "right");
        c.save(); c.translate(W / 2, 236 * s); c.fillStyle = p.ink; c.beginPath(); c.moveTo(-34 * s, 0); c.lineTo(30 * s, 0); c.lineTo(18 * s, -12 * s); c.lineTo(26 * s, -12 * s); c.lineTo(42 * s, 0); c.lineTo(26 * s, 12 * s); c.lineTo(18 * s, 12 * s); c.lineTo(30 * s, 0); c.closePath(); c.fill(); c.restore();
        [["PASSENGER", "YOU & FRIENDS"], ["FLIGHT", "VS 2911"], ["DATE", m.date], ["SEAT", "07A"]].forEach(([k, v], i) => {
          const x = px + (i % 2) * (iw / 2), y = 300 * s + Math.floor(i / 2) * 46 * s;
          text(c, k, x, y, `700 ${12 * s}px ${SANS}`, p.ink, "left", 3 * s); text(c, v, x, y + 22 * s, `800 ${20 * s}px ${MONO}`, p.ink, "left");
        });
        [mg, W - mg].forEach((x) => { c.beginPath(); c.arc(x, perf, 20 * s, 0, 7); c.fillStyle = p.mono ? "#fff" : p.c; c.fill(); if (p.mono) { c.lineWidth = 3 * s; c.stroke(); } });
        dash(c, mg + 20 * s, W - mg - 20 * s, perf, s, p.ink);
        barcode(c, W / 2, perf + 40 * s, iw * 0.84, 96 * s, s * 1.3, m.code, p.ink);
        text(c, `${m.brand.toUpperCase()}  ·  ${m.code}`, W / 2, perf + 176 * s, `700 ${18 * s}px ${MONO}`, p.ink, "center", 3 * s);
        text(c, m.when, W / 2, perf + 208 * s, `${16 * s}px ${MONO}`, p.ink);
      },
    };
  },
});

const invoice = (n: number): Frame => ({
  id: `invoice-${n}`, name: "Invoice Lunas", blurb: "Tagihan bestie, sudah LUNAS", era: "kini", count: n,
  pal: { bg: "#ffffff", ink: "#0d0d0d", a: "#e3c777", b: "#a98432", c: "#e6e1d4", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, px = 46 * s, ix2 = W - px, iw = W - px * 2, gap = 20 * s, top = 330 * s;
    const g = gridSlots(n, px, top, iw, gap, [1, 1.4, 1]);
    const fy = top + g.h + 40 * s, H = Math.round(fy + 380 * s);
    const lime = p.mono ? "#ddd" : p.a, stampC = p.mono ? "#000" : p.b;
    return {
      H, slots: g.slots,
      under: (c) => {
        zigPaper(c, W, H, s, p, p.bg);
        text(c, "INVOICE", px, 130 * s, `900 ${92 * s}px ${ROUND}`, p.ink, "left", -2 * s);
        rr(c, px, 156 * s, 210 * s, 44 * s, 22 * s); c.fillStyle = lime; c.fill(); c.lineWidth = 3 * s; c.strokeStyle = p.ink; c.stroke();
        text(c, `#${m.code}`, px + 105 * s, 187 * s, `800 ${24 * s}px ${MONO}`, p.ink);
        text(c, "RECEIPT PHOTOBOOTH", ix2, 184 * s, `700 ${14 * s}px ${SANS}`, p.ink, "right", 3 * s);
        dash(c, px, ix2, 226 * s, s, p.ink);
        row(c, "BILLED TO", "DATE", 258 * s, px, ix2, `700 ${13 * s}px ${SANS}`, p.ink);
        row(c, "bestie kesayangan", m.date, 288 * s, px, ix2, `800 ${24 * s}px ${MONO}`, p.ink);
        g.slots.forEach((r) => { c.fillStyle = p.ink; c.fillRect(r.x + 8 * s, r.y + 8 * s, r.w, r.h); }); // bayangan keras
        dash(c, px, ix2, fy, s, p.ink);
        [["Tawa lepas", "x2"], ["Pose random", "x1"], ["Pelukan", "x4"]].forEach(([l, r], i) => row(c, l, `${r}    Rp 0`, fy + 40 * s + i * 32 * s, px, ix2, `${22 * s}px ${MONO}`, p.ink));
        rr(c, px - 8 * s, fy + 134 * s, iw + 16 * s, 62 * s, 10 * s); c.fillStyle = lime; c.fill(); c.lineWidth = 3 * s; c.strokeStyle = p.ink; c.stroke();
        row(c, "TOTAL", "Rp 0", fy + 177 * s, px, ix2, `900 ${34 * s}px ${ROUND}`, p.ink);
        stamp(c, "LUNAS", W - px - 96 * s, fy + 262 * s, s, -0.2, stampC, 44);
        barcode(c, px + 104 * s, fy + 296 * s, 200 * s, 44 * s, s * 0.8, m.code, p.ink);
        text(c, m.when, px, fy + 362 * s, `${16 * s}px ${MONO}`, p.ink, "left");
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 4 * s; g.slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

const resi = (n: number): Frame => ({
  id: `resi-${n}`, name: "Resi Paket", blurb: "Label paket: isinya kenangan", era: "kini", count: n,
  pal: { bg: "#ffffff", ink: "#0d0d0d", a: "#c9a24a", b: "#f3e8c9", c: "#dedad2", mono: false },
  build(W, p, m) {
    const s = W / PAPER_W, mg = 22 * s, px = 44 * s, iw = W - px * 2, gap = 12 * s, top = 392 * s;
    const slots = stackSlots(n, px, top, iw, R[n] + 0.05, gap), gh = stackH(n, iw, R[n] + 0.05, gap), fy = top + gh + 34 * s, H = Math.round(fy + 400 * s);
    return {
      H, slots,
      under: (c) => {
        c.fillStyle = p.mono ? "#fff" : p.c; c.fillRect(0, 0, W, H);
        c.fillStyle = "#fff"; c.fillRect(mg, mg, W - mg * 2, H - mg * 2); c.lineWidth = 6 * s; c.strokeStyle = "#000"; c.strokeRect(mg, mg, W - mg * 2, H - mg * 2);
        c.fillStyle = "#000"; c.fillRect(mg, mg, W - mg * 2, 84 * s);
        text(c, "RESI  ·  RECEIPT PHOTOBOOTH", W / 2, mg + 52 * s, `800 ${24 * s}px ${SANS}`, "#fff", "center", 3 * s);
        [["PENGIRIM", m.brand], ["PENERIMA", "Kamu & geng"]].forEach(([k, v], i) => {
          const x = px + i * (iw / 2 + 6 * s);
          text(c, k, x, 160 * s, `700 ${12 * s}px ${SANS}`, p.ink, "left", 3 * s); text(c, v, x, 192 * s, `800 ${23 * s}px ${MONO}`, p.ink, "left");
        });
        c.fillStyle = p.ink; c.fillRect(px, 212 * s, iw, 3 * s);
        row(c, "BERAT  0 g", "ONGKIR  Rp 0", 246 * s, px, px + iw, `700 ${18 * s}px ${MONO}`, p.ink);
        row(c, "COD  Rp 0", m.date, 274 * s, px, px + iw, `700 ${18 * s}px ${MONO}`, p.ink);
        c.save(); c.beginPath(); c.rect(px, 300 * s, iw, 60 * s); c.clip();
        c.fillStyle = p.mono ? "#fff" : p.b; c.fillRect(px, 300 * s, iw, 60 * s);
        c.fillStyle = p.mono ? "#000" : p.a; for (let x = -80 * s; x < iw + 80 * s; x += 44 * s) { c.beginPath(); c.moveTo(px + x, 360 * s); c.lineTo(px + x + 22 * s, 360 * s); c.lineTo(px + x + 52 * s, 300 * s); c.lineTo(px + x + 30 * s, 300 * s); c.fill(); }
        c.restore();
        c.fillStyle = "#fff"; rr(c, W / 2 - 150 * s, 310 * s, 300 * s, 40 * s, 8 * s); c.fill(); c.lineWidth = 3 * s; c.strokeStyle = "#000"; c.stroke();
        text(c, "FRAGILE · KENANGAN DI DALAM", W / 2, 338 * s, `800 ${17 * s}px ${SANS}`, p.ink, "center", 1 * s);
        dash(c, px, px + iw, fy, s, p.ink);
        barcode(c, px + iw * 0.36, fy + 30 * s, iw * 0.62, 100 * s, s * 1.2, m.code, p.ink);
        const q = 21, qs = 5.2 * s, qx = px + iw - q * qs, qy = fy + 20 * s, rnd = seeded(m.code + "q");
        for (let i = 0; i < q; i++) for (let j = 0; j < q; j++) { const finder = (i < 7 || i > 13) && (j < 7 || j > 13) && !(i > 13 && j > 13); if (finder ? (i % 14 === 0 || j % 14 === 0 || (i % 14 > 1 && i % 14 < 5 && j % 14 > 1 && j % 14 < 5) || (i > 13 && (i - 14) % 7 === 0)) && (i % 14 < 7 && j % 14 < 7) : rnd() > 0.5) { c.fillStyle = "#000"; c.fillRect(qx + i * qs, qy + j * qs, qs, qs); } }
        text(c, `NO. RESI  VS-${m.code}`, W / 2, fy + 188 * s, `800 ${24 * s}px ${MONO}`, p.ink, "center", 2 * s);
        text(c, m.when, W / 2, fy + 224 * s, `${18 * s}px ${MONO}`, p.ink);
        text(c, "Terima kasih sudah mampir", W / 2, fy + 282 * s, `${26 * s}px ${HAND}`, p.ink);
      },
      over: (c) => { c.strokeStyle = p.ink; c.lineWidth = 4 * s; slots.forEach((r) => c.strokeRect(r.x, r.y, r.w, r.h)); },
    };
  },
});

const DESIGNS = [receipt, notaWarung, tiket, dotMatrix, cafe, boarding, invoice, resi];
/** 8 desain x 1/2/3 foto (maksimal 3 kotak). */
export const FRAMES: Frame[] = [3, 2, 1].flatMap((n) => DESIGNS.map((d) => d(n)));
export const COUNTS = [1, 2, 3] as const;

const DUMMY: Meta = { brand: "", title: "", subtitle: "", handle: "", when: "", date: "", code: "000000" };
const cache = new Map<string, number[]>();
/** Rasio lebar/tinggi tiap kotak foto (dipakai untuk memotong hasil kamera). */
export function slotRatios(f: Frame) {
  if (!cache.has(f.id)) cache.set(f.id, f.build(PAPER_W, f.pal, DUMMY).slots.map((r) => r.w / r.h));
  return cache.get(f.id)!;
}
/** Posisi tiap kotak foto pada lebar kertas W (untuk menaruh tombol di atas pratinjau). */
export const slotRects = (f: Frame, W = PAPER_W) => f.build(W, f.pal, DUMMY).slots;
export const slotCount = (f: Frame) => slotRatios(f).length;

function cover(ctx: Ctx, src: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const k = Math.max(w / src.width, h / src.height), dw = src.width * k, dh = src.height * k;
  ctx.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Gambar frame lengkap. `mono` = versi cetak thermal. Foto kosong digambar sebagai kotak penanda. */
export function renderFrame(frame: Frame, shots: (HTMLCanvasElement | null)[], meta: Meta, W = PAPER_W, mono = false): HTMLCanvasElement {
  const pal = mono ? MONO_PAL : frame.pal, b = frame.build(W, pal, meta);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = b.H;
  const c = cv.getContext("2d")!;
  b.under(c);
  b.slots.forEach((r, i) => {
    c.save();
    if (r.rot) { c.translate(r.x + r.w / 2, r.y + r.h / 2); c.rotate(r.rot); c.translate(-(r.x + r.w / 2), -(r.y + r.h / 2)); }
    if (r.border) {
      const { w: bw, color, extra = 0 } = r.border;
      c.save(); c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 14 * (W / PAPER_W); c.shadowOffsetY = 4 * (W / PAPER_W);
      rr(c, r.x - bw, r.y - bw, r.w + bw * 2, r.h + bw * 2 + extra, (r.r ?? 0) + bw / 2); c.fillStyle = color; c.fill(); c.restore();
      if (mono) { c.lineWidth = 3 * (W / PAPER_W); c.strokeStyle = "#000"; rr(c, r.x - bw, r.y - bw, r.w + bw * 2, r.h + bw * 2 + extra, (r.r ?? 0) + bw / 2); c.stroke(); }
    }
    rr(c, r.x, r.y, r.w, r.h, r.r ?? 0); c.save(); c.clip();
    const shot = shots[i];
    if (shot) cover(c, shot, r.x, r.y, r.w, r.h);
    else {
      c.fillStyle = "#e6e6e6"; c.fillRect(r.x, r.y, r.w, r.h);
      text(c, String(i + 1), r.x + r.w / 2, r.y + r.h / 2 + Math.min(r.w, r.h) * 0.12, `700 ${Math.min(r.w, r.h) * 0.35}px ${SANS}`, "#a0a0a0");
    }
    c.restore(); c.restore();
  });
  b.over?.(c);
  return cv;
}
