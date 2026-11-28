import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, CheckCheck, ChevronLeft, Delete, MessageCircle, Pointer, Printer, QrCode, Send, Sparkles, Star, RotateCcw, Settings, X } from "lucide-react";
import QRCode from "qrcode";
import dayjs from "dayjs";
import clsx from "clsx";
import { COUNTS, FRAMES, renderFrame, slotCount, slotRatios, slotRects, type Frame, type Meta } from "./frames";
import { ds, Mascot } from "./ds";
import { sendFeedback, sendLink, uploadResult } from "./api";
import { connectPrinter, printCanvas, printerName, printerSupported, toThermalCanvas } from "./print";

type Screen = "start" | "frame" | "shoot" | "review" | "wa" | "busy" | "done";
type Settings = { brand: string; title: string; handle: string; price: string; facing: "user" | "environment"; autoPrint: boolean };

const MAX_RETAKE = 2;
const REVIEW_W = 520;
const POSES = ["Pose bebas!", "Senyum lebar", "Gaya paling gokil", "Peluk / gandengan", "Tos bareng!", "Muka serius"];
const IDLE_RESET = 90; // detik tanpa sentuhan sebelum kembali ke layar awal
const TAGS = ["Seru banget", "Hasil bagus", "Printer lambat", "Kamera kurang jelas", "Frame kurang banyak", "Antrean lama"];
const DEFAULTS: Settings = { brand: "Visuelstory", title: "", handle: "", price: "Rp 25.000", facing: "user", autoPrint: true };
const KEY = "photobooth-settings";

const loadSettings = (): Settings => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULTS; } };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const btn = ds.btn;
const glass = ds.card;

/** Ukuran elemen (px), diperbarui saat layar diputar / diubah. */
function useBox() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, box] as const;
}
const fit = (ratio: number, maxW: number, maxH: number) => { const w = Math.max(0, Math.min(maxW, maxH * ratio)); return { w, h: w / ratio }; };

/** Kamera (portrait diutamakan untuk tablet); dimatikan otomatis saat layar bukan "shoot". */
function useCamera(active: boolean, facing: Settings["facing"]) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!active) return;
    let dead = false, stream: MediaStream | undefined;
    const portrait = window.innerHeight >= window.innerWidth;
    navigator.mediaDevices?.getUserMedia({
      video: { facingMode: facing, width: { ideal: portrait ? 1080 : 1920 }, height: { ideal: portrait ? 1920 : 1080 } }, audio: false,
    })
      .then((s) => {
        if (dead) return s.getTracks().forEach((t) => t.stop());
        stream = s; setError("");
        if (video.current) { video.current.srcObject = s; video.current.play().catch(() => undefined); }
      })
      .catch(() => setError("Kamera tidak bisa diakses. Izinkan akses kamera di browser."));
    return () => { dead = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [active, facing]);
  return { video, error };
}

type Printable = { color: string; mono: string };

/**
 * Meniru printer thermal: kepala cetak menyapu dari atas, titik-titik hitam muncul baris demi baris
 * (versi 1-bit sungguhan), kertas bergetar halus tiap langkah. `settle` = setelah selesai, warna soft file
 * "menyala" di atas hasil cetak. Lalu struk disobek & jatuh, ganti struk berikutnya.
 */
function PrintingReceipt({ items, fast = false, settle = false }: { items: Printable[]; fast?: boolean; settle?: boolean }) {
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(0);
  const [tint, setTint] = useState(false);
  const [tear, setTear] = useState(false);
  useEffect(() => {
    let dead = false, t = 0;
    const step = fast ? 60 : 95;
    const run = () => {
      setTear(false); setTint(false); setPct(0);
      let p = 0;
      const tick = () => {
        if (dead) return;
        p += 1.6; setPct(Math.min(p, 100));
        if (p < 100) { t = window.setTimeout(tick, step); return; }
        t = window.setTimeout(() => {
          if (dead) return;
          if (settle) setTint(true);
          t = window.setTimeout(() => {
            if (dead) return;
            setTear(true);
            t = window.setTimeout(() => { if (dead) return; setI((x) => x + 1); run(); }, 700);
          }, settle ? 2600 : 700);
        }, 350);
      };
      t = window.setTimeout(tick, fast ? 150 : 500);
    };
    run();
    return () => { dead = true; clearTimeout(t); };
  }, [fast, settle, items.length]);
  if (!items.length) return null;
  const cur = items[i % items.length], printing = pct < 100;
  const jitter = printing ? (Math.round(pct / 1.6) % 2 ? 0.7 : -0.7) : 0; // getar halus saat kertas maju per baris
  return (
    <div className="relative" style={{ transform: tear ? "translateY(90px) rotate(5deg)" : `translateX(${jitter}px)`, opacity: tear ? 0 : 1, transition: tear ? "transform .7s ease-in, opacity .7s ease-in" : "none" }}>
      <img src={cur.mono} alt="" draggable={false} className="w-full shadow-xl" style={{ clipPath: `inset(0 0 ${100 - pct}% 0)`, imageRendering: "pixelated" }} />
      {settle && <img src={cur.color} alt="" draggable={false} className="absolute inset-0 w-full transition-opacity duration-700" style={{ opacity: tint ? 1 : 0 }} />}
      {printing && pct > 0 && (
        <span aria-hidden className="absolute inset-x-0 h-[5px] bg-neutral-900" style={{ top: `calc(${pct}% - 2px)`, boxShadow: "0 0 10px 3px rgba(255,79,46,.75), 0 0 2px 1px rgba(255,200,120,.9)" }} />
      )}
    </div>
  );
}

const normPhone = (v: string) => { let d = v.replace(/\D/g, ""); if (d.startsWith("0")) d = "62" + d.slice(1); else if (d.startsWith("8")) d = "62" + d; return d; };
const validPhone = (v: string) => /^62\d{8,12}$/.test(normPhone(v));
const fmtPhone = (v: string) => v.replace(/(\d{4})(?=\d)/g, "$1 ");

function Keypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) => k === "" ? <span key={i} /> : (
        <button key={k} onClick={() => { navigator.vibrate?.(8); onChange(k === "del" ? value.slice(0, -1) : (value + k).slice(0, 14)); }} aria-label={k === "del" ? "Hapus" : k}
          className="grid h-[clamp(3.25rem,8.5vmin,4.75rem)] place-items-center rounded-2xl border-[3px] border-neutral-950 bg-white text-2xl font-black shadow-[0_3px_0_#171717] transition active:translate-y-[2px] active:bg-[#c9a24a] active:shadow-none">
          {k === "del" ? <Delete className="size-6" /> : k}
        </button>
      ))}
    </div>
  );
}

/** Foto contoh hitam-putih (siluet) untuk memeriahkan layar awal. */
function samplePortrait(ratio: number, seed: number) {
  const W = 360, H = Math.round(W / ratio), c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, ["#f3e8c9", "#e3c777", "#ddd8cc", "#c4bdac", "#f1e2b3"][seed % 5]); g.addColorStop(1, ["#a98432", "#85671f", "#4a4639", "#2b2824", "#c9a24a"][seed % 5]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const cx = W * (0.38 + ((seed * 37) % 24) / 100), hr = Math.min(W, H) * 0.17;
  x.fillStyle = "#fbf7ec"; x.beginPath(); x.arc(cx, H * 0.42, hr, 0, 7); x.fill();
  x.beginPath(); x.ellipse(cx, H * 0.98, hr * 2.1, hr * 1.7, 0, Math.PI, 0); x.fill();
  if (seed % 2) { x.beginPath(); x.arc(cx + hr * 2.1, H * 0.52, hr * 0.8, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx + hr * 2.1, H * 1.02, hr * 1.5, hr * 1.3, 0, Math.PI, 0); x.fill(); }
  return c;
}

type Guide = { x: number; y: number; w: number; h: number };

/** Potong video tepat sesuai kotak panduan yang terlihat di layar (video tampil object-cover). */
function snap(video: HTMLVideoElement, box: { w: number; h: number }, g: Guide, ratio: number, mirror: boolean) {
  const W = 1000, H = Math.round(W / ratio);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const vw = video.videoWidth, vh = video.videoHeight, k = Math.max(box.w / vw, box.h / vh);
  const ox = (box.w - vw * k) / 2, oy = (box.h - vh * k) / 2;
  const sw = g.w / k, sh = g.h / k, sy = (g.y - oy) / k;
  const sx = mirror ? vw - (g.x + g.w - ox) / k : (g.x - ox) / k;
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); } // sama dengan yang terlihat di layar
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
  return c;
}

export default function Photobooth() {
  const [screen, setScreen] = useState<Screen>(() => (import.meta.env.DEV && (new URLSearchParams(location.search).get("s") as Screen)) || "start");
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [cnt, setCnt] = useState<number>(3);
  const [frame, setFrame] = useState<Frame>(FRAMES[0]);
  const [shots, setShots] = useState<(HTMLCanvasElement | null)[]>([]);
  const [retakes, setRetakes] = useState<number[]>([]);
  const [target, setTarget] = useState(0);
  const [retaking, setRetaking] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const [qr, setQr] = useState<{ img: string; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [left, setLeft] = useState(IDLE_RESET);
  const [phone, setPhone] = useState("");
  const [phoneToSend, setPhoneToSend] = useState<string | null>(null);
  const [waState, setWaState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [sendAnim, setSendAnim] = useState(false);
  const [sess, setSess] = useState<{ id: string; url: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [fbDone, setFbDone] = useState(false);
  const finalRef = useRef<{ blob: Blob } | null>(null);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;

  useEffect(() => { document.title = "Receipt Photobooth · Visuelstory"; }, []);
  // Hanya development: ?s=done mengisi QR contoh agar layar akhir bisa dilihat tanpa melewati sesi
  useEffect(() => {
    if (!import.meta.env.DEV || new URLSearchParams(location.search).get("s") !== "done") return;
    const url = `${location.origin}/p/K7M2Q`;
    QRCode.toDataURL(url, { margin: 1, width: 560, errorCorrectionLevel: "L" }).then((img) => setQr({ url, img }));
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* abaikan */ } }, [settings]);

  const mirror = settings.facing === "user";
  const { video, error: camError } = useCamera(screen === "shoot", settings.facing);
  const [shootRef, shootBox] = useBox();
  const [reviewRef, reviewBox] = useBox();
  const meta = useCallback((code = "000000"): Meta => ({ brand: settings.brand, title: settings.title, subtitle: "", handle: settings.handle, when: dayjs().format("DD.MM.YYYY HH:mm"), date: dayjs().format("DD.MM.YY"), code }), [settings]);

  const previews = useMemo(() => (screen !== "frame" ? [] : FRAMES.map((f) => { const c = renderFrame(f, [], meta(), 300); return { f, src: c.toDataURL(), w: c.width, h: c.height }; })), [screen, meta]);
  const review = useMemo(() => { if (screen !== "review") return null; const c = renderFrame(frame, shots, meta(), REVIEW_W); return { src: c.toDataURL(), w: c.width, h: c.height }; }, [screen, frame, shots, meta]);
  const wall = useMemo(() => {
    if (screen !== "start") return [] as Printable[];
    return FRAMES.filter((f) => f.count === 3).map((f, k) => {
      const shots = slotRatios(f).map((q, i) => samplePortrait(q, i + k));
      return { color: renderFrame(f, shots, meta("K7M2Q9"), 300, false).toDataURL(), mono: toThermalCanvas(renderFrame(f, shots, meta("K7M2Q9"), 300, true)).toDataURL() };
    });
  }, [screen, meta]);
  const busyImg = useMemo(() => (screen === "busy" || screen === "wa" ? { color: "", mono: toThermalCanvas(renderFrame(frame, shots, meta("K7M2Q9"), 360, true)).toDataURL() } : null), [screen, frame, shots, meta]);
  const confetti = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ left: (i * 97) % 100, delay: (i % 9) * 0.25, dur: 3 + (i % 5) * 0.6, w: 6 + (i % 4) * 3, c: ["#c9a24a", "#e3c777", "#171717", "#ffffff", "#a98432"][i % 5], rot: (i * 53) % 360 })), []);
  const thumbs = useMemo(() => shots.map((s) => (s ? s.toDataURL("image/jpeg", 0.5) : null)), [shots]);

  const slots = slotCount(frame);
  const ratio = slotRatios(frame)[target] ?? 1;
  // Kotak panduan potongan foto, di tengah kamera layar penuh
  const gSize = fit(ratio, shootBox.w * 0.9, shootBox.h * 0.74);
  const guide: Guide = { x: (shootBox.w - gSize.w) / 2, y: (shootBox.h - gSize.h) / 2 - shootBox.h * 0.02, w: gSize.w, h: gSize.h };

  const snapRef = useRef({ box: shootBox, guide, ratio });
  snapRef.current = { box: shootBox, guide, ratio };

  const reset = useCallback(() => {
    setScreen("start"); setShots([]); setRetakes([]); setQr(null); setFailed(false); setRetaking(false); setCount(null); setLast(null);
    finalRef.current = null;
    setPhone(""); setSendAnim(false); setPhoneToSend(null); setWaState("idle"); setSess(null); setRating(0); setTags([]); setComment(""); setFbDone(false);
  }, []);

  // Kembali otomatis ke awal setelah selesai
  useEffect(() => {
    if (screen !== "done") return;
    setLeft(IDLE_RESET);
    const t = setInterval(() => setLeft((l) => (l <= 1 ? (reset(), IDLE_RESET) : l - 1)), 1000);
    return () => clearInterval(t);
  }, [screen, reset]);

  const begin = () => { document.documentElement.requestFullscreen?.().catch(() => undefined); setScreen("frame"); };
  // Pilih frame = langsung mulai: tanpa tombol lanjut / tombol rana
  const chooseFrame = (f: Frame) => {
    const n = slotCount(f);
    setFrame(f); setShots(Array(n).fill(null)); setRetakes(Array(n).fill(0)); setTarget(0); setRetaking(false); setScreen("shoot");
  };

  // Urutan otomatis: bersiap -> 3-2-1 -> jepret -> tampilkan sebentar -> foto berikutnya / review
  useEffect(() => {
    if (screen !== "shoot" || camError) return;
    let dead = false;
    (async () => {
      while (!dead && !(video.current && video.current.videoWidth > 0)) await sleep(150);
      while (!dead && !(snapRef.current.box.w > 0)) await sleep(100);
      await sleep(1200);
      for (let n = 3; n >= 1; n--) { if (dead) return; setCount(n); await sleep(1000); }
      if (dead || !video.current) return;
      setCount(null);
      const live = snapRef.current; // nilai terbaru, bukan yang tertangkap saat efek dimulai
      const cv = snap(video.current, live.box, live.guide, live.ratio, mirror);
      setFlash(true); setLast(cv.toDataURL("image/jpeg", 0.6)); setTimeout(() => setFlash(false), 180);
      const next = shotsRef.current.map((x, i) => (i === target ? cv : x));
      setShots(next);
      await sleep(1200);
      if (dead) return;
      setLast(null);
      if (retaking) { setRetaking(false); setScreen("review"); return; }
      const ne = next.findIndex((x) => !x);
      if (ne === -1) setScreen("review"); else setTarget(ne);
    })();
    return () => { dead = true; setCount(null); };
    // guide/box dibaca lewat snapRef saat jepret; hanya urutan yang memicu ulang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, target, retaking, camError]);

  const retake = (i: number) => {
    if (retakes[i] >= MAX_RETAKE) return;
    setRetakes((r) => r.map((v, k) => (k === i ? v + 1 : v)));
    setTarget(i); setRetaking(true); setScreen("shoot");
  };

  const upload = async (blob: Blob) => {
    try {
      const { id } = await uploadResult(blob);
      const url = `${location.origin}/p/${id}`; // link pendek: mudah di-scan dan diketik
      setSess({ id, url });
      setQr({ url, img: await QRCode.toDataURL(url, { margin: 1, width: 560, errorCorrectionLevel: "L" }) });
      setFailed(false);
    } catch { setFailed(true); }
  };

  // Selesai: cetak + unggah berjalan di latar sementara pengunjung mengisi nomor WhatsApp
  const finish = async () => {
    setScreen("wa"); setPhone("");
    await sleep(60);
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const m = meta(code);
    const full = renderFrame(frame, shots, m, 1152, false); // soft file berwarna
    const blob = await new Promise<Blob>((res) => full.toBlob((b) => res(b!), "image/jpeg", 0.92));
    finalRef.current = { blob };
    if (settings.autoPrint) void printCanvas(renderFrame(frame, shots, m, 576, true)); // diam-diam: tanpa dialog / pesan
    void upload(blob);
  };
  const proceed = (withPhone: boolean) => {
    if (!withPhone) { setScreen("busy"); return; }
    setPhoneToSend(normPhone(phone)); setSendAnim(true); // pesawat kertas meluncur dulu, baru lanjut
    setTimeout(() => { setSendAnim(false); setScreen("busy"); }, 1500);
  };

  // QR baru muncul setelah langkah WhatsApp; kirim link begitu unggahan siap
  useEffect(() => { if (screen === "busy" && (qr || failed)) setScreen("done"); }, [screen, qr, failed]);
  useEffect(() => {
    if (!sess || !phoneToSend || waState !== "idle") return;
    setWaState("sending");
    sendLink(sess.id, phoneToSend, sess.url).then((ok) => setWaState(ok ? "sent" : "failed")).catch(() => setWaState("failed"));
  }, [sess, phoneToSend, waState]);

  const toggleTag = (t: string) => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  const submitFeedback = async () => { setFbDone(true); await sendFeedback({ id: sess?.id, rating, tags, comment: comment.trim() }).catch(() => undefined); };

  const filled = shots.filter(Boolean).length;
  const shown = previews.filter(({ f }) => f.count === cnt);
  const rf = review ? fit(review.w / review.h, reviewBox.w, reviewBox.h) : { w: 0, h: 0 };

  return (
    <div className="fixed inset-0 z-50 touch-manipulation select-none overflow-hidden bg-[#faf8f4] text-neutral-900">

      {screen === "start" && (
        <div className="pb-screen relative flex h-full flex-col items-center gap-[clamp(0.875rem,2.6vmin,1.75rem)] p-[clamp(1rem,3.2vmin,2rem)] text-center">
          {/* Wordmark: tebal & tegas */}
          <div className="relative z-10 flex shrink-0 flex-col items-center gap-3">
            <LongPress onLong={() => setShowSettings(true)}>
              <h1 className={clsx(ds.display, "whitespace-nowrap text-[clamp(2.4rem,11vmin,6.5rem)] leading-[0.95] [text-shadow:5px_5px_0_#c9a24a]")}>
                {[...settings.brand].map((ch, i) => <span key={i} className="pb-letter inline-block" style={{ animationDelay: `${200 + i * 55}ms` }}>{ch === " " ? "\u00a0" : ch}</span>)}
              </h1>
            </LongPress>
            <p className="rounded-full bg-neutral-950 px-5 py-1.5 text-[clamp(0.7rem,2.1vmin,1rem)] font-black tracking-[0.4em] text-[#e3c777]">RECEIPT PHOTOBOOTH</p>
          </div>

          {/* Celah printer; struk keluar baris demi baris ala thermal */}
          <div className="relative min-h-0 w-full flex-1">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-full max-w-md -translate-x-1/2 rounded-full border-[3px] border-neutral-950 bg-neutral-950 shadow-[0_4px_0_#c9a24a]">
              <span className="pb-led absolute right-5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#e3c777]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 top-4 mx-auto w-[min(70%,18rem)] overflow-hidden" style={{ maskImage: "linear-gradient(#000 84%, transparent)", WebkitMaskImage: "linear-gradient(#000 84%, transparent)" }}>
              <PrintingReceipt items={wall} settle />
            </div>
          </div>

          {/* Maskot menunjuk ke START */}
          <div className="relative z-10 flex shrink-0 items-end justify-center gap-[clamp(0.875rem,2.6vmin,1.75rem)]">
            <Mascot mood="happy" className="w-[clamp(5.5rem,18vmin,10rem)] shrink-0" />
            <div className="relative">
              {settings.price && <span className="pb-sticker absolute -right-5 -top-7 z-10 rotate-6 rounded-xl border-[3px] border-neutral-950 bg-white px-3.5 py-1.5 text-[clamp(0.95rem,2.6vmin,1.4rem)] font-black leading-none shadow-[3px_3px_0_#171717]">{settings.price}</span>}
              <button onClick={begin} aria-label="Mulai" className="pb-pulse flex items-center gap-4 rounded-full border-[4px] border-neutral-950 bg-[#c9a24a] px-[clamp(2.25rem,9vmin,4.5rem)] py-[clamp(1.1rem,3.4vmin,1.8rem)] text-[clamp(1.4rem,4vmin,2.2rem)] font-black tracking-[0.25em] text-neutral-950 transition active:translate-y-[6px]">
                <span className="size-3 rounded-full bg-neutral-950" />START
              </button>
            </div>
          </div>

          {/* Cara pakai tanpa kata: sentuh -> pose -> struk tercetak -> scan */}
          <div className="flex shrink-0 items-center gap-[clamp(0.35rem,1.6vmin,0.9rem)]" aria-hidden>
            {[Pointer, Camera, Printer, QrCode].map((Icon, i) => (
              <div key={i} className="flex items-center gap-[clamp(0.35rem,1.6vmin,0.9rem)]">
                <span className="pb-step grid size-[clamp(2.75rem,8vmin,4.5rem)] place-items-center rounded-2xl border-[3px] border-neutral-950 bg-white" style={{ animationDelay: `${i * 1.5}s`, "--c": "#c9a24a" } as React.CSSProperties}>
                  <Icon className="size-1/2" strokeWidth={2} />
                </span>
                {i < 3 && <span className="w-[clamp(0.75rem,3vmin,1.75rem)] border-t-[3px] border-dashed border-neutral-950" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "frame" && (
        <div className="pb-screen relative flex h-full flex-col gap-[clamp(0.875rem,2.6vmin,1.75rem)] p-[clamp(1rem,3.2vmin,2rem)]">
          <Header onBack={() => setScreen("start")} title="Pilih frame" />
          <div className="flex shrink-0 gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none]">
            {COUNTS.map((n) => (
              <button key={n} onClick={() => setCnt(n)} className={clsx(ds.chip(cnt === n), "flex shrink-0 items-center gap-2")}>
                <span className="flex gap-0.5">{Array.from({ length: n }, (_, i) => <span key={i} className={clsx("size-2.5 rounded-sm border-2", cnt === n ? "border-[#e3c777] bg-[#e3c777]" : "border-neutral-950 bg-neutral-950")} />)}</span>{n} foto
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <div className="grid grid-cols-2 gap-[clamp(0.875rem,2.6vmin,1.75rem)] sm:grid-cols-3 landscape:lg:grid-cols-5">
              {shown.map(({ f, src, w, h }, i) => (
                <button key={f.id} onClick={() => chooseFrame(f)} style={{ animationDelay: `${i * 90}ms` }} className={clsx("pb-rise flex flex-col items-center gap-3 p-4 transition active:scale-[0.97]", glass)}>
                  <img src={src} width={w} height={h} alt={f.name} className="pb-reveal w-full rounded-md border-2 border-neutral-950" style={{ animationDelay: `${i * 90 + 150}ms` }} />
                  <span className="text-base font-black leading-tight">{f.name}</span>
                  <span className="text-xs font-semibold text-neutral-600">{f.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "shoot" && (
        <div ref={shootRef} className="absolute inset-0 bg-black">
          <video ref={video} playsInline muted className="absolute inset-0 size-full object-cover" style={{ transform: mirror ? "scaleX(-1)" : undefined }} />
          {/* Area di luar kotak diredupkan: hanya isi kotak yang masuk ke struk */}
          <div aria-hidden className="absolute rounded-3xl" style={{ left: guide.x, top: guide.y, width: guide.w, height: guide.h, boxShadow: "0 0 0 200vmax rgba(0,0,0,.58)" }} />
          <div className="pointer-events-none absolute" style={{ left: guide.x, top: guide.y, width: guide.w, height: guide.h }}>
            {(["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"] as const).map((c) => (
              <span key={c} className={clsx("absolute size-10 border-white", c)} />
            ))}
            <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-3xl">
              {last && (
                <>
                  <img src={last} alt="" className="pb-pop-in absolute inset-0 size-full object-cover" />
                  <span className="pb-pop-in absolute bottom-4 flex items-center gap-2 rounded-full bg-white px-5 py-2 text-base font-bold text-neutral-900 shadow-xl"><Check className="size-5 text-emerald-600" />Foto {target + 1} tersimpan!</span>
                </>
              )}
              {count !== null && (
                <div key={count} className="relative grid place-items-center">
                  <svg viewBox="0 0 120 120" className="absolute size-[clamp(9rem,36vmin,18rem)] -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.25)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e3c777" strokeWidth="6" strokeLinecap="round" pathLength={100} strokeDasharray="100" className="pb-ring" />
                  </svg>
                  <span className="pb-pop relative text-[clamp(5rem,24vmin,11rem)] font-extrabold leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.5)]">{count}</span>
                </div>
              )}
              {count === null && !last && !camError && (
                <div className="flex flex-col items-center gap-2 rounded-3xl bg-black/45 px-8 py-5 text-center text-white backdrop-blur">
                  <Sparkles className="size-7" />
                  <span className="text-lg font-semibold">Siap-siap, lihat kamera…</span>
                </div>
              )}
              {flash && <div className="absolute inset-0 bg-white" />}
            </div>
          </div>
          {camError && <p className="absolute inset-0 grid place-items-center p-8 text-center text-lg text-white">{camError}</p>}

          {/* Atas: langkah + arahan pose */}
          <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-3 p-[clamp(1rem,3.2vmin,2rem)] pt-[calc(env(safe-area-inset-top)+clamp(1rem,3.2vmin,2rem))]">
            <div className="flex w-full items-center justify-between">
              {filled === 0 && !retaking ? <button onClick={() => setScreen("frame")} aria-label="Kembali" className="grid size-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur active:scale-90"><ChevronLeft className="size-6" /></button> : <span className="size-12" />}
              <div className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 backdrop-blur">
                {Array.from({ length: slots }, (_, i) => (
                  <span key={i} className={clsx("grid size-7 place-items-center rounded-full text-xs font-bold transition-all", shots[i] && i !== target ? "bg-white text-neutral-900" : i === target ? "scale-110 bg-[#c9a24a] text-neutral-900 ring-4 ring-[#c9a24a]/40" : "border border-white/50 text-white/70")}>
                    {shots[i] && i !== target ? <Check className="size-4" /> : i + 1}
                  </span>
                ))}
              </div>
              <span className="size-12" />
            </div>
            <div className="flex flex-col items-center rounded-3xl bg-[#c9a24a] px-6 py-3 text-center shadow-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">{retaking ? `Ulangi foto ${target + 1}` : `Foto ${target + 1} dari ${slots}`}</span>
              <span className="text-[clamp(1.25rem,3.6vmin,2rem)] font-extrabold leading-tight text-neutral-900">{POSES[target % POSES.length]}</span>
            </div>
          </div>

          {/* Bawah: rekap pose yang sudah diambil */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-[clamp(1rem,3.2vmin,2rem)] pb-[calc(env(safe-area-inset-bottom)+clamp(1rem,3.2vmin,2rem))]">
            <p className="text-sm font-medium text-white/85">{filled === 0 ? "Pose pertamamu akan muncul di sini" : `${filled} dari ${slots} pose tersimpan`}</p>
            <div className="flex gap-3">
              {Array.from({ length: slots }, (_, i) => (
                <div key={i} className={clsx("relative size-[clamp(3.5rem,11vmin,5.5rem)] overflow-hidden rounded-2xl border-2 bg-black/40 backdrop-blur transition-all", i === target ? "scale-110 border-[#c9a24a]" : "border-white/30")}>
                  {thumbs[i] ? <img src={thumbs[i]!} alt={`Pose ${i + 1}`} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-lg font-bold text-white/60">{i + 1}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "review" && review && (
        <div className="pb-screen relative flex h-full flex-col gap-[clamp(0.875rem,2.6vmin,1.75rem)] p-[clamp(1rem,3.2vmin,2rem)]">
          <Header title="Hasil sesimu" />
          {/* Struk hasil = satu-satunya tampilan; ketuk foto mana pun untuk mengulangnya */}
          <div ref={reviewRef} className="relative min-h-0 min-w-0 flex-1">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl" style={{ width: rf.w, height: rf.h }}>
              <img src={review.src} alt="Hasil" className="pb-reveal-slow size-full rounded-sm" draggable={false} />
              {slotRects(frame, REVIEW_W).map((r, i) => {
                const sc = rf.w / REVIEW_W, left = retakes[i] >= MAX_RETAKE, remain = MAX_RETAKE - retakes[i];
                return (
                  <button key={i} onClick={() => retake(i)} disabled={left} aria-label={`Ulangi foto ${i + 1}`}
                    className={clsx("pb-fade-late group absolute overflow-hidden transition", !left && "active:bg-white/25")}
                    style={{ left: r.x * sc, top: r.y * sc, width: r.w * sc, height: r.h * sc, borderRadius: (r.r ?? 0) * sc }}>
                    <span className={clsx("absolute right-2 top-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur", left ? "bg-black/35 text-white/70" : "bg-neutral-900 text-white")}>
                      <RotateCcw className="size-3.5" />
                      <span className="flex gap-1">{Array.from({ length: MAX_RETAKE }, (_, k) => <span key={k} className={clsx("size-1.5 rounded-full", k < remain ? "bg-[#c9a24a]" : "bg-white/30")} />)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pb-fade-late flex justify-center pb-1"><button onClick={finish} className={clsx(btn, "flex w-full max-w-md items-center justify-center gap-2")}><Check className="size-5" />Selesai</button></div>
        </div>
      )}

      {screen === "wa" && (
        <div className="pb-screen relative flex h-full flex-col items-center gap-[clamp(0.875rem,2.6vmin,1.75rem)] p-[clamp(1rem,3.2vmin,2rem)] landscape:flex-row landscape:items-stretch landscape:gap-[clamp(1.5rem,5vmin,4rem)]">
          {/* Panggung kiri: struk asli sedang dicetak + maskot yang ikut bereaksi */}
          <div className="relative min-h-0 w-full flex-1 landscape:h-full landscape:w-auto">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-full max-w-xs -translate-x-1/2 rounded-full border-[3px] border-neutral-950 bg-neutral-950 shadow-[0_4px_0_#c9a24a] landscape:max-w-sm"><span className="pb-led absolute right-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#e3c777]" /></div>
            <div className="absolute inset-x-0 bottom-0 top-4 mx-auto w-[min(60%,14rem)] overflow-hidden landscape:bottom-[clamp(7rem,22vmin,11rem)] landscape:w-[min(70%,19rem)]" style={{ maskImage: "linear-gradient(#000 84%, transparent)", WebkitMaskImage: "linear-gradient(#000 84%, transparent)" }}>
              {busyImg && <PrintingReceipt items={[busyImg]} fast />}
            </div>
            <div key={phone.length} className="pb-hop absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 landscape:block">
              <Mascot mood={validPhone(phone) ? "happy" : phone ? "wow" : "wink"} className="w-[clamp(5.5rem,17vmin,9rem)]" />
            </div>
          </div>
          <div className={clsx("pb-rise relative flex w-full max-w-md shrink-0 flex-col gap-3 p-5 landscape:self-center", glass)}>
            <div className="flex items-center gap-3">
              <div key={phone.length} className="pb-hop shrink-0 landscape:hidden"><Mascot mood={validPhone(phone) ? "happy" : phone ? "wow" : "wink"} className="w-14" /></div>
              <div className="text-left">
                <p className="text-lg font-black leading-tight">Kirim link fotonya?</p>
                <p className="text-xs font-semibold text-neutral-600">Isi nomor WhatsApp, foto soft file masuk ke sana.</p>
              </div>
            </div>

            {/* Ekspektasi: pesan yang akan diterima */}
            <div className="rounded-2xl border-[3px] border-neutral-950 bg-[#f3e8c9] p-3 text-left">
              <div className="mb-2 flex items-center gap-2 text-xs font-black">
                <span className="grid size-6 place-items-center rounded-full bg-neutral-950 text-[#e3c777]"><MessageCircle className="size-3.5" /></span>
                <span className="font-mono">{phone ? `+${fmtPhone(normPhone(phone))}` : "WhatsApp kamu"}</span>
              </div>
              <div className="relative rounded-xl rounded-tl-sm border-2 border-neutral-950 bg-white px-3 py-2 text-xs leading-snug">
                {phone.length > 0 ? (
                  <>
                    <p className="pb-rise font-semibold">Hai! Foto Receipt Photobooth-mu sudah jadi.</p>
                    <p className="pb-rise font-mono font-bold underline" style={{ animationDelay: "120ms" }}>{location.host}/p/XXXXX</p>
                  </>
                ) : (
                  <span className="flex items-center gap-1 py-1" aria-label="Mengetik">{[0, 1, 2].map((i) => <span key={i} className="pb-typing size-2 rounded-full bg-neutral-400" style={{ animationDelay: `${i * 180}ms` }} />)}</span>
                )}
                {validPhone(phone) && <CheckCheck className="pb-pop-in absolute -bottom-2 right-2 size-5 rounded-full bg-white text-[#a98432]" />}
              </div>
            </div>

            <div className="flex h-14 items-center justify-center rounded-2xl border-[3px] border-neutral-950 bg-white px-4 font-mono text-[clamp(1.4rem,4vmin,2rem)] font-bold tracking-widest">
              {phone ? [...fmtPhone(phone)].map((ch, i) => (ch === " " ? <span key={i} className="w-3" /> : <span key={`${i}${ch}`} className="pb-pop-in inline-block">{ch}</span>)) : <span className="text-neutral-300">08xx xxxx xxxx</span>}
              <span className="pb-caret ml-1 inline-block h-[1.1em] w-[3px] bg-neutral-950" />
            </div>
            <div className="flex justify-center gap-1.5" aria-hidden>
              {Array.from({ length: 12 }, (_, i) => <span key={i} className={clsx("h-1.5 w-5 rounded-full transition-colors duration-200", i < normPhone(phone).length - 2 ? (validPhone(phone) ? "bg-[#c9a24a]" : "bg-neutral-950") : "bg-neutral-200")} />)}
            </div>

            <Keypad value={phone} onChange={setPhone} />
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <button onClick={() => proceed(false)} className={ds.btn2}>Lewati</button>
              <button onClick={() => proceed(true)} disabled={!validPhone(phone)} className={clsx(ds.btn, "flex items-center justify-center gap-2 !px-4 !py-3.5 text-base", validPhone(phone) && "pb-nudge")}><Send className="size-5" />Kirim link</button>
            </div>
            <p className="text-[11px] font-semibold text-neutral-500">Nomor hanya dipakai untuk mengirim link foto ini, lalu dihapus dari layar.</p>

            {sendAnim && (
              <div className="pb-fade-in absolute inset-0 z-20 grid place-items-center overflow-hidden rounded-[22px] bg-white/92 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Send className="pb-fly size-16 text-neutral-950" strokeWidth={1.6} />
                  <p className="text-lg font-black">Link meluncur ke WhatsApp…</p>
                  <p className="font-mono text-sm font-bold">+{fmtPhone(normPhone(phone))}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === "busy" && (
        <div className="pb-screen relative flex h-full flex-col items-center justify-center px-[18vmin] py-10">
          <div className="relative min-h-0 w-full flex-1">
            <div className="absolute left-1/2 top-0 z-10 h-4 w-full max-w-sm -translate-x-1/2 rounded-full bg-neutral-900 shadow-lg"><span className="pb-led absolute right-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#e3c777]" /></div>
            <div className="absolute inset-x-0 bottom-0 top-3 mx-auto w-[min(64%,17rem)] overflow-hidden" style={{ maskImage: "linear-gradient(#000 82%, transparent)", WebkitMaskImage: "linear-gradient(#000 82%, transparent)" }}>
              {busyImg && <PrintingReceipt items={[busyImg]} fast />}
            </div>
          </div>
        </div>
      )}

      {screen === "done" && (
        <div className="pb-screen absolute inset-0 overflow-y-auto overflow-x-hidden" onPointerDownCapture={() => setLeft(IDLE_RESET)} onInputCapture={() => setLeft(IDLE_RESET)}>
          {confetti.map((k, i) => <span key={i} aria-hidden className="pb-confetti pointer-events-none absolute top-0" style={{ left: `${k.left}%`, width: k.w, height: k.w * 1.8, background: k.c, animationDelay: `${k.delay}s`, animationDuration: `${k.dur}s`, transform: `rotate(${k.rot}deg)` }} />)}
          <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-[clamp(0.875rem,2.6vmin,1.75rem)] p-[clamp(1rem,3.2vmin,2rem)] text-center landscape:max-w-5xl landscape:flex-row landscape:gap-[clamp(2rem,6vmin,5rem)]">
            {/* Kiri (landscape) / atas: ucapan + QR */}
            <div className="flex w-full flex-col items-center gap-[clamp(0.875rem,2.6vmin,1.75rem)] landscape:flex-1">
            <Mascot mood="happy" className="w-[clamp(4.5rem,13vmin,7rem)] landscape:w-[clamp(4rem,11vmin,6rem)]" />
            <h2 className={clsx(ds.display, "pb-rise text-[clamp(1.75rem,6vmin,3rem)] leading-none [text-shadow:3px_3px_0_#c9a24a]")}>Terima kasih!</h2>
            {waState === "sent" && phoneToSend && (
              <p className="pb-rise flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-[#e3c777]" style={{ animationDelay: "150ms" }}><MessageCircle className="size-4" />Link dikirim ke WhatsApp ••••{phoneToSend.slice(-4)}</p>
            )}
            {waState === "failed" && <p className="pb-rise rounded-full bg-white/80 px-4 py-2 text-sm font-semibold">Link belum terkirim ke WhatsApp. Scan QR di bawah ya.</p>}
            {qr ? (
              <div className={clsx("pb-bounce flex flex-col items-center gap-2 p-5", glass)} style={{ animationDelay: "250ms" }}>
                <img src={qr.img} alt="QR unduh" className="w-[min(62vw,34dvh,20rem)] rounded-xl border-2 border-neutral-950 bg-white p-2 landscape:w-[min(34vw,38dvh,19rem)]" />
                <p className="font-semibold">Scan untuk unduh soft file</p>
                <p className="font-mono text-xs tracking-wide text-neutral-600">{qr.url.replace(/^https?:\/\//, "")}</p>
              </div>
            ) : failed ? (
              <div className={clsx("flex flex-col items-center gap-3 p-6", glass)}>
                <p className="font-semibold">Soft file belum terunggah</p>
                <button onClick={() => finalRef.current && upload(finalRef.current.blob)} className={btn}>Coba lagi</button>
              </div>
            ) : null}
            </div>

            {/* Kanan (landscape) / bawah: kritik & saran + tombol selesai */}
            <div className="flex w-full max-w-md flex-col items-center gap-[clamp(0.875rem,2.6vmin,1.75rem)] landscape:flex-1">
            <div className={clsx("pb-rise flex w-full flex-col gap-3 p-5 text-left", glass)} style={{ animationDelay: "450ms" }}>
              {fbDone ? (
                <div className="flex flex-col items-center gap-3 py-3 text-center">
                  <span className="pb-stamp rounded-lg border-4 border-[#a98432] px-5 py-1.5 text-2xl font-black tracking-[0.2em] text-[#a98432]">TERKIRIM</span>
                  <p className="text-sm font-semibold">Makasih masukannya!</p>
                </div>
              ) : (
                <>
                  <p className="text-center text-base font-extrabold">Gimana pengalamanmu?</p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} aria-label={`${n} bintang`} className="p-1 transition active:scale-90">
                        <Star key={n <= rating ? `on${n}` : `off${n}`} className={clsx("size-10", n <= rating ? "pb-pop-in fill-[#c9a24a] text-neutral-900" : "text-neutral-400")} strokeWidth={1.6} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="pb-rise flex flex-col gap-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        {TAGS.map((t) => <button key={t} onClick={() => toggleTag(t)} className={clsx(ds.chip(tags.includes(t)), "!px-3.5 !py-2 text-xs")}>{t}</button>)}
                      </div>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 300))} rows={2} placeholder="Kritik & saran (opsional)" className="w-full resize-none rounded-2xl border-[3px] border-neutral-950 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a24a]" />
                      <button onClick={submitFeedback} className={clsx(btn, "w-full py-3.5 text-base")}>Kirim masukan</button>
                    </div>
                  )}
                </>
              )}
            </div>

            <button onClick={reset} className={clsx(ds.btn2, "pb-rise px-8")} style={{ animationDelay: "650ms" }}>Selesai · kembali dalam {left} dtk</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} meta={meta} />}
    </div>
  );
}

function Header({ onBack, title }: { onBack?: () => void; title: string }) {
  return (
    <div className="relative flex items-center justify-between">
      {onBack ? <button onClick={onBack} aria-label="Kembali" className="grid size-12 place-items-center rounded-full border-[3px] border-neutral-950 bg-white shadow-[0_3px_0_#171717] active:translate-y-0.5 active:shadow-none"><ChevronLeft className="size-6" /></button> : <span className="size-12" />}
      <h2 className="font-[Arial_Black,Helvetica,sans-serif] text-xl font-black uppercase tracking-tight">{title}</h2>
      <span className="size-12" />
    </div>
  );
}

/** Tahan ±1 detik untuk membuka pengaturan (tersembunyi dari pengunjung). */
function LongPress({ onLong, children }: { onLong: () => void; children: React.ReactNode }) {
  const t = useRef<number | undefined>(undefined);
  return (
    <div onPointerDown={() => { t.current = window.setTimeout(onLong, 1000); }} onPointerUp={() => clearTimeout(t.current)} onPointerLeave={() => clearTimeout(t.current)}>
      {children}
    </div>
  );
}

function SettingsPanel({ settings, onChange, onClose, meta }: { settings: Settings; onChange: (s: Settings) => void; onClose: () => void; meta: (c?: string) => Meta }) {
  const [printer, setPrinter] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { printerName().then(setPrinter).catch(() => undefined); }, []);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v });
  const field = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm";

  const connect = async () => {
    try { setPrinter(await connectPrinter()); setMsg("Printer terhubung. Izin tersimpan; cetak berikutnya otomatis."); }
    catch { setMsg("Printer tidak dipilih / gagal terhubung."); }
  };
  const test = async () => {
    const c = renderFrame(FRAMES[0], [null, null, null], meta("TEST00"), 576, true);
    const r = await printCanvas(c);
    setMsg(r === "ok" ? "Tes cetak terkirim." : r === "no-printer" ? "Belum ada printer terhubung." : "Cetak gagal, cek kabel / kertas.");
  };

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-md space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold"><Settings className="size-4" />Pengaturan photobooth</h3><button onClick={onClose} aria-label="Tutup"><X className="size-5" /></button></div>
        {(["brand", "title", "handle", "price"] as const).map((k) => (
          <label key={k} className="block text-xs font-medium uppercase tracking-wide text-neutral-500">{({ brand: "Nama brand", title: "Judul acara (opsional)", handle: "Akun Instagram (opsional)", price: "Harga per sesi (kosong = disembunyikan)" })[k]}
            <input value={settings[k]} onChange={(e) => set(k, e.target.value)} className={clsx(field, "mt-1 normal-case tracking-normal text-neutral-900")} />
          </label>
        ))}
        <div className="flex gap-2 text-sm">
          {(["user", "environment"] as const).map((f) => <button key={f} onClick={() => set("facing", f)} className={clsx("flex-1 rounded-full border py-2", settings.facing === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300")}>{f === "user" ? "Kamera depan" : "Kamera belakang"}</button>)}
        </div>
        <label className="flex items-center justify-between rounded-xl bg-neutral-100 px-3 py-3 text-sm">Cetak otomatis saat selesai
          <input type="checkbox" checked={settings.autoPrint} onChange={(e) => set("autoPrint", e.target.checked)} className="size-5" />
        </label>
        <div className="space-y-2 rounded-xl bg-neutral-100 p-3 text-sm">
          <p className="font-medium">Printer: {printer ?? "belum terhubung"}</p>
          {!printerSupported() && <p className="text-xs text-red-600">Browser ini tidak mendukung WebUSB (iOS/Safari/Firefox). Pakai Chrome di Android atau desktop.</p>}
          <div className="flex gap-2">
            <button onClick={connect} disabled={!printerSupported()} className="flex-1 rounded-full bg-neutral-900 py-2 text-white disabled:opacity-40">Hubungkan printer</button>
            <button onClick={test} className="flex-1 rounded-full border border-neutral-400 py-2">Tes cetak</button>
          </div>
          {msg && <p className="text-xs text-neutral-600">{msg}</p>}
        </div>
        <p className="text-[11px] text-neutral-400">Panel ini dibuka dengan menahan nama brand di layar awal selama 1 detik.</p>
      </div>
    </div>
  );
}
