import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clapperboard, Crop, Download, Film, Frame, ImagePlus, LayoutGrid, Palette, Play, Plus, RectangleVertical, RotateCcw, Share2, Sparkles, Timer, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import Metadata from "@components/Metadata";
import {
  avgColor, DEFAULT_ADJ, disposePhoto, drawSlide, drawStill, FILTERS, filterSupported, GRID_LAYOUTS, loadPhoto, makeGif, makeVideo, overflow,
  pickVideoMime, RATIOS, renderGrid, type Adj, type CellRect, type GridLayout, type Photo, type Style,
} from "./render";

type Mode = "grid" | "gif" | "video";
type Result = { url: string; ext: string; kind: "image" | "video"; size: number; file: File };

const MAX_PHOTOS = 30;
const SWATCHES = ["#ffffff", "#f5efe6", "#fde2e4", "#dbeafe", "#dcfce7", "#d4af37", "#1f2937", "#000000"];

const MODES = [
  { m: "grid" as const, t: "Grid", icon: LayoutGrid },
  { m: "gif" as const, t: "GIF", icon: Film },
  { m: "video" as const, t: "Video", icon: Clapperboard },
];
const GRID_TOOLS = [
  { id: "template", t: "Template", icon: LayoutGrid },
  { id: "color", t: "Warna", icon: Palette },
  { id: "frame", t: "Bingkai", icon: Frame },
  { id: "filter", t: "Filter", icon: Sparkles },
  { id: "photo", t: "Foto", icon: Crop },
];
const SLIDE_TOOLS = [
  { id: "ratio", t: "Rasio", icon: RectangleVertical },
  { id: "time", t: "Waktu", icon: Timer },
  { id: "filter", t: "Filter", icon: Sparkles },
  { id: "photo", t: "Foto", icon: Crop },
];

const lbl = "mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/50";
const pill = (on: boolean) => clsx("rounded-full px-3.5 py-1.5 text-sm font-medium transition active:scale-95", on ? "bg-gold-500 text-neutral-950" : "bg-white/10 text-white/80 hover:bg-white/15");
const slider = "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#d4af37]";

function Switch({ on, onChange, title, desc }: { on: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-[11px] text-white/50">{desc}</span>
      </span>
      <span className={clsx("relative h-6 w-10 shrink-0 rounded-full transition", on ? "bg-gold-500" : "bg-white/20")}>
        <span className={clsx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on ? "left-[1.1rem]" : "left-0.5")} />
      </span>
    </button>
  );
}

/** Gambar mini tatanan: tiap kotak = satu foto. */
function LayoutThumb({ l, on, onClick }: { l: GridLayout; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on} title={l.label}
      className={clsx("flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition active:scale-95 lg:w-auto", on ? "bg-gold-500/20 ring-1 ring-gold-500" : "bg-white/5 hover:bg-white/10")}>
      <div className="grid h-12 w-full place-items-center">
        <div className="relative h-full" style={{ aspectRatio: `${1 / l.ratio}`, maxWidth: "100%" }}>
          {l.cells.map(([c, r, cs, rs], i) => (
            <span key={i} className={clsx("absolute rounded-[2px]", on ? "bg-gold-500" : "bg-white/50")}
              style={{ left: `calc(${(c / l.cols) * 100}% + 1px)`, top: `calc(${(r / l.rows) * 100}% + 1px)`, width: `calc(${(cs / l.cols) * 100}% - 2px)`, height: `calc(${(rs / l.rows) * 100}% - 2px)` }} />
          ))}
        </div>
      </div>
      <span className="text-center text-[10px] font-medium leading-tight text-white/80">{l.label}</span>
    </button>
  );
}

export default function Studio() {
  const navigate = useNavigate();
  const close = () => (window.history.length > 1 ? navigate(-1) : navigate("/account/profile"));
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mode, setMode] = useState<Mode>("grid");
  const [tool, setTool] = useState("template");
  const [layoutId, setLayoutId] = useState("2x2");
  const [cnt, setCnt] = useState<number | "auto" | "all">("auto");
  const [gap, setGap] = useState(16);
  const [round, setRound] = useState(0);
  const [bg, setBg] = useState("#ffffff");
  const [ratioId, setRatioId] = useState("9:16");
  const [seconds, setSeconds] = useState(1.5);
  const [fade, setFade] = useState(true);
  const [kb, setKb] = useState(true);
  const [filterId, setFilterId] = useState("none");
  const [adjs, setAdjs] = useState<Record<string, Adj>>({});
  const [selId, setSelId] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);

  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef<CellRect[]>([]);
  const curIdx = useRef(0);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const layout = GRID_LAYOUTS.find((l) => l.id === layoutId)!;
  const ratio = RATIOS.find((r) => r.id === ratioId)!;
  const fx = FILTERS.find((f) => f.id === filterId)!.css;
  const style: Style = { adjs, filter: fx };
  const slideOpts = { ...style, seconds, fade: fade ? Math.min(0.5, seconds / 2) : 0, zoom: mode === "video" && kb };
  const videoOk = !!pickVideoMime();
  const fxOk = filterSupported();
  const tools = (mode === "grid" ? GRID_TOOLS : SLIDE_TOOLS).filter((t) => t.id !== "filter" || fxOk);
  const activeTool = tools.find((t) => t.id === tool)?.id ?? tools[0].id;
  const counts = [...new Set(GRID_LAYOUTS.map((l) => l.cells.length))].sort((a, b) => a - b);
  const shownCnt = cnt === "auto" ? (counts.includes(photos.length) ? photos.length : "all") : cnt;
  const sel = photos.find((p) => p.id === selId) ?? null;
  const selAdj = (selId && adjs[selId]) || DEFAULT_ADJ;
  const need2 = mode !== "grid" && photos.length < 2;

  // Foto bersifat sementara: bersihkan semuanya saat halaman ditutup
  useEffect(() => () => { photosRef.current.forEach(disposePhoto); }, []);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  // Pratinjau: grid statis; GIF/video berputar, berhenti saat satu foto dipilih untuk diedit
  useEffect(() => {
    const c = canvas.current;
    if (!c || !photos.length) return;
    if (mode === "grid") { cells.current = renderGrid(c, photos, layout, gap, bg, round, style, selId); return; }
    c.width = ratio.w; c.height = ratio.h;
    const ctx = c.getContext("2d")!;
    const picked = photos.find((p) => p.id === selId);
    if (picked) { drawStill(ctx, picked, style); return; }
    if (photos.length < 2) { drawSlide(ctx, photos, 0, slideOpts); return; }
    const total = photos.length * seconds, t0 = performance.now();
    let raf = requestAnimationFrame(function loop() {
      curIdx.current = drawSlide(ctx, photos, (((performance.now() - t0) / 1000) % total) * 0.9999, slideOpts);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, mode, layout, gap, bg, round, ratio, seconds, fade, kb, fx, adjs, selId]);

  const add = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photosRef.current.length;
    if (files.length > room) toast.info(`Maksimal ${MAX_PHOTOS} foto.`);
    const ok: Photo[] = [];
    for (const f of [...files].filter((f) => f.type.startsWith("image/")).slice(0, room)) {
      try { ok.push(await loadPhoto(f)); } catch { toast.error(`${f.name}: format tidak didukung browser.`); }
    }
    setPhotos((p) => [...p, ...ok]);
  }, []);

  const removeSel = () => {
    if (!sel) return;
    disposePhoto(sel);
    setPhotos((p) => p.filter((x) => x.id !== sel.id));
    setSelId(null);
  };
  const setZoom = (z: number) => selId && setAdjs((a) => ({ ...a, [selId]: { ...(a[selId] ?? DEFAULT_ADJ), z } }));
  const resetSel = () => selId && setAdjs((a) => { const n = { ...a }; delete n[selId]; return n; });

  /* ----- Geser foto langsung di pratinjau ----- */
  const pan = useRef<{ pid: string; sx: number; sy: number; a: Adj; cell: { w: number; h: number } } | null>(null);
  const toCanvas = (e: React.PointerEvent) => {
    const c = canvas.current!, r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height, k: c.width / r.width };
  };
  const onCanvasDown = (e: React.PointerEvent) => {
    if (!photos.length) return;
    const { x, y } = toCanvas(e);
    let pid: string | null = null, cell = { w: canvas.current!.width, h: canvas.current!.height };
    if (mode === "grid") {
      const hit = cells.current.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
      if (hit) { pid = hit.pid; cell = { w: hit.w, h: hit.h }; }
    } else pid = selId ?? photos[Math.min(curIdx.current, photos.length - 1)].id; // GIF/video: ketuk = jeda foto yang tampil
    setSelId(pid);
    if (!pid) return;
    if (mode !== "grid" && !selId) return; // ketukan pertama hanya menjeda
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pan.current = { pid, sx: e.clientX, sy: e.clientY, a: adjs[pid] ?? DEFAULT_ADJ, cell };
  };
  const onCanvasMove = (e: React.PointerEvent) => {
    const g = pan.current;
    if (!g) return;
    const ph = photos.find((p) => p.id === g.pid);
    if (!ph) return;
    const { k } = toCanvas(e);
    const { ox, oy } = overflow(ph.bmp, g.cell.w, g.cell.h, g.a.z);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const nx = ox > 1 ? clamp(g.a.x + ((e.clientX - g.sx) * k) / (ox / 2)) : 0;
    const ny = oy > 1 ? clamp(g.a.y + ((e.clientY - g.sy) * k) / (oy / 2)) : 0;
    setAdjs((a) => ({ ...a, [g.pid]: { ...g.a, x: nx, y: ny } }));
  };

  /* ----- Susun ulang foto: tahan lalu geser (sentuh) / langsung geser (mouse) ----- */
  const tray = useRef<HTMLUListElement>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; active: boolean; timer?: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  useEffect(() => {
    const el = tray.current;
    if (!el) return;
    const stop = (e: TouchEvent) => { if (drag.current?.active) e.preventDefault(); };
    el.addEventListener("touchmove", stop, { passive: false });
    return () => el.removeEventListener("touchmove", stop);
  });
  const startDrag = () => { if (drag.current) { drag.current.active = true; setDragId(drag.current.id); navigator.vibrate?.(10); } };
  const trayDown = (e: React.PointerEvent, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, sx: e.clientX, sy: e.clientY, active: false };
    if (e.pointerType !== "mouse") drag.current.timer = window.setTimeout(startDrag, 250);
  };
  const trayMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
      if (e.pointerType === "mouse") startDrag();
      else { clearTimeout(d.timer); drag.current = null; return; } // geser sebelum tahan = scroll
    }
    const over = (document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-pid]") as HTMLElement | null)?.dataset.pid;
    if (!over || over === d.id) return;
    setPhotos((p) => {
      const from = p.findIndex((x) => x.id === d.id), to = p.findIndex((x) => x.id === over);
      if (from < 0 || to < 0) return p;
      const n = [...p]; n.splice(to, 0, n.splice(from, 1)[0]); return n;
    });
  };
  const trayUp = () => {
    const d = drag.current;
    if (d) { clearTimeout(d.timer); if (!d.active) setSelId((s) => (s === d.id ? null : d.id)); }
    drag.current = null; setDragId(null);
  };

  const generate = async () => {
    if (!photos.length || need2) return;
    setBusy(0); setSelId(null);
    try {
      let blob: Blob, ext: string;
      if (mode === "grid") {
        const c = document.createElement("canvas");
        renderGrid(c, photos, layout, gap, bg, round, style, null);
        blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Gagal membuat gambar."))), "image/png"));
        ext = "png";
      } else if (mode === "gif") { blob = await makeGif(photos, ratio, slideOpts, setBusy); ext = "gif"; }
      else { blob = await makeVideo(photos, ratio, slideOpts, setBusy); ext = blob.type.includes("mp4") ? "mp4" : "webm"; }
      setResult({ url: URL.createObjectURL(blob), ext, kind: mode === "video" ? "video" : "image", size: blob.size, file: new File([blob], `visuelstory-${mode}.${ext}`, { type: blob.type }) });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal membuat hasil."); }
    finally { setBusy(null); }
  };
  // Tanpa await sebelum share(): izin "klik pengguna" bisa hangus kalau menunggu dulu
  const canShareFile = (r: Result) => typeof navigator.canShare === "function" && navigator.canShare({ files: [r.file] });
  const share = (r: Result) =>
    navigator.share({ files: [r.file], title: "Visuelstory" }).catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return; // ditutup pengguna
      toast.error("Browser ini tidak bisa membagikan file. Gunakan tombol Unduh.");
    });

  const modeName = mode === "grid" ? "grid" : mode === "gif" ? "GIF" : "video";
  const modeNav = (cls: string) => (
    <nav aria-label="Jenis karya" className={clsx("items-center justify-center gap-1", cls)}>
      {MODES.map(({ m, t, icon: Icon }) => (
        <button key={m} onClick={() => { setMode(m); setSelId(null); }} aria-current={mode === m}
          className={clsx("flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition active:scale-95", mode === m ? "bg-white/15 text-gold-300" : "text-white/60 hover:text-white")}>
          <Icon className="size-5" />{t}
        </button>
      ))}
    </nav>
  );
  // Mobile: kapsul kaca cair, penanda aktif bergeser mulus antar tab
  const activeMode = MODES.findIndex((x) => x.m === mode);
  const liquidNav = (
    <nav aria-label="Jenis karya"
      className="relative mx-auto h-16 w-full max-w-xs rounded-full border border-white/25 bg-white/[0.12] shadow-[0_10px_30px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(255_255_255/0.08)] backdrop-blur-2xl backdrop-saturate-[1.8]">
      <div aria-hidden className="pointer-events-none absolute inset-1.5">
        <span className="absolute inset-y-0 left-0 w-[calc((100%-0.5rem)/3)] rounded-full bg-white/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(calc(${activeMode} * (100% + 0.25rem)))` }} />
      </div>
      <ul className="relative grid h-full grid-cols-3 gap-1 p-1.5">
        {MODES.map(({ m, t, icon: Icon }) => (
          <li key={m}>
            <button onClick={() => { setMode(m); setSelId(null); }} aria-current={mode === m}
              className={clsx("flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium transition-colors duration-300 active:scale-95", mode === m ? "text-gold-300" : "text-white/70")}>
              <Icon className={clsx("size-[22px] transition-transform duration-300", mode === m && "scale-110")} />{t}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  /* ----- Panel pengaturan (di bawah pratinjau) ----- */
  const panel = (() => {
    switch (activeTool) {
      case "template": return (
        <div>
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {[["auto", `Sesuai foto (${photos.length})`], ["all", "Semua"], ...counts.map((n) => [n, `${n} foto`])].map(([k, t]) => (
              <button key={String(k)} onClick={() => setCnt(k as typeof cnt)} className={clsx(pill(cnt === k), "shrink-0 !px-3 !py-1 text-xs")}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible">
            {GRID_LAYOUTS.filter((l) => shownCnt === "all" || l.cells.length === shownCnt).map((l) => <LayoutThumb key={l.id} l={l} on={l.id === layoutId} onClick={() => setLayoutId(l.id)} />)}
          </div>
          {photos.length > 0 && photos.length !== layout.cells.length && (
            <p className="mt-2 text-[11px] text-white/50">{photos.length < layout.cells.length ? `Ada ${layout.cells.length - photos.length} kotak kosong, diisi ulang dari foto Anda.` : `Hanya ${layout.cells.length} foto pertama yang dipakai.`}</p>
          )}
        </div>
      );
      case "color": return (
        <div>
          <span className={lbl}>Warna latar</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {SWATCHES.map((c) => (
              <button key={c} aria-label={c} onClick={() => setBg(c)} style={{ background: c }}
                className={clsx("size-9 rounded-full border border-white/20 transition active:scale-90", bg === c && "ring-2 ring-gold-500 ring-offset-2 ring-offset-neutral-900")} />
            ))}
            <label className="relative grid size-9 cursor-pointer place-items-center rounded-full border border-dashed border-white/40" title="Warna sendiri">
              <Plus className="size-4" /><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
            </label>
            {photos[0] && <button onClick={() => setBg(avgColor(photos[0].bmp))} className={clsx(pill(false), "!py-1.5 text-xs")}>Dari foto</button>}
          </div>
        </div>
      );
      case "frame": return (
        <div className="space-y-4">
          <div><span className={lbl}>Jarak antar foto · {gap}</span><input type="range" min={0} max={48} value={gap} onChange={(e) => setGap(+e.target.value)} className={slider} /></div>
          <div><span className={lbl}>Sudut membulat · {round}</span><input type="range" min={0} max={80} value={round} onChange={(e) => setRound(+e.target.value)} className={slider} /></div>
        </div>
      );
      case "ratio": return (
        <div>
          <span className={lbl}>Bentuk</span>
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => <button key={r.id} onClick={() => setRatioId(r.id)} className={pill(r.id === ratioId)}>{r.id} <span className="text-[10px] opacity-70">{r.hint}</span></button>)}
          </div>
        </div>
      );
      case "time": return (
        <div className="space-y-4">
          <div><span className={lbl}>Lama tiap foto · {seconds.toFixed(1)} detik</span><input type="range" min={0.5} max={4} step={0.1} value={seconds} onChange={(e) => setSeconds(+e.target.value)} className={slider} /></div>
          <div className="divide-y divide-white/10 rounded-xl bg-white/5">
            <Switch on={fade} onChange={setFade} title="Transisi" desc="Perpindahan antar foto lebih mulus" />
            {mode === "video" && <Switch on={kb} onChange={setKb} title="Zoom pelan" desc="Setiap foto membesar perlahan" />}
          </div>
          {mode === "video" && !videoOk && <p className="text-xs text-red-400">Browser ini belum mendukung perekaman video.</p>}
          {mode === "video" && videoOk && <p className="text-[11px] text-white/50">Video direkam real-time; biarkan tab terbuka.</p>}
        </div>
      );
      case "filter": return (
        <div>
          <span className={lbl}>Filter untuk semua foto</span>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilterId(f.id)} className="flex shrink-0 flex-col items-center gap-1 active:scale-95">
                <span className={clsx("block size-14 overflow-hidden rounded-xl bg-neutral-700", filterId === f.id && "ring-2 ring-gold-500")}>
                  {photos[0] && <img src={photos[0].thumb} alt="" style={{ filter: f.css }} className="size-full object-cover" />}
                </span>
                <span className={clsx("text-[10px]", filterId === f.id ? "text-gold-300" : "text-white/60")}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      default: return sel ? (
        <div className="space-y-4">
          <div><span className={lbl}>Zoom · {selAdj.z.toFixed(1)}×</span><input type="range" min={1} max={3} step={0.05} value={selAdj.z} onChange={(e) => setZoom(+e.target.value)} className={slider} /></div>
          <div className="flex gap-2">
            <button onClick={resetSel} className={clsx(pill(false), "flex items-center gap-1.5")}><RotateCcw className="size-4" />Reset</button>
            <button onClick={removeSel} className={clsx(pill(false), "flex items-center gap-1.5 !text-red-400")}><Trash2 className="size-4" />Hapus foto</button>
          </div>
          <p className="text-[11px] text-white/50">Geser foto langsung di pratinjau untuk mengatur posisinya.</p>
        </div>
      ) : (
        <p className="py-3 text-center text-sm text-white/60">Ketuk satu foto — di pratinjau atau di deretan bawah — lalu geser &amp; zoom untuk mengatur posisinya.</p>
      );
    }
  })();

  const genBtn = (cls = "") => (
    <button onClick={generate} disabled={!photos.length || need2 || busy !== null || (mode === "video" && !videoOk)}
      className={clsx("relative overflow-hidden rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-neutral-950 transition active:scale-95 disabled:opacity-40", cls)}>
      {busy !== null && <span aria-hidden className="absolute inset-y-0 left-0 bg-black/20" style={{ width: `${busy * 100}%` }} />}
      <span className="relative">{busy !== null ? `${Math.round(busy * 100)}%` : `Buat ${modeName}`}</span>
    </button>
  );

  const fileInput = <input type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-950 text-white lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1">
      <Metadata title="Studio Foto" />

      {/* Kiri: pratinjau besar + deretan foto */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-none">
        <div className="flex shrink-0 items-center justify-between gap-3 px-3 pb-1 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
          <button onClick={close} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white/10 active:scale-90"><ChevronLeft className="size-5" /></button>
          {modeNav("hidden lg:flex")}
          <span className="text-sm font-medium text-white/70 lg:hidden">Studio {modeName}</span>
          {photos.length > 0 ? genBtn() : <span className="size-9" />}
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center p-3">
          {photos.length === 0 ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
              className={clsx("flex w-full max-w-xs flex-col items-center gap-6 rounded-3xl p-6 text-center transition", dragging && "bg-gold-500/10 ring-1 ring-gold-500")}>
              <ImagePlus className="size-12 text-gold-400" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold">{mode === "grid" ? "Buat kolase foto" : mode === "gif" ? "Buat GIF" : "Buat video"}</h2>
              <label className="flex w-full cursor-pointer items-center justify-center rounded-full bg-gold-500 py-3.5 text-base font-semibold text-neutral-950 transition active:scale-95">
                Pilih foto{fileInput}
              </label>
              <p className="text-xs text-white/40">Diproses di perangkat Anda, tidak diunggah.</p>
            </div>
          ) : (
            <>
              <canvas ref={canvas} onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={() => (pan.current = null)} onPointerCancel={() => (pan.current = null)}
                style={{ touchAction: "none" }}
                className="max-h-full max-w-full cursor-grab rounded-xl shadow-2xl active:cursor-grabbing" />
              {mode !== "grid" && sel && (
                <button onClick={() => setSelId(null)} className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs backdrop-blur"><Play className="size-3.5" />Putar</button>
              )}
            </>
          )}
        </div>

        {/* Deretan foto */}
        {photos.length > 0 && (
          <ul ref={tray} className="flex shrink-0 gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none]">
            {photos.map((p, i) => (
              <li key={p.id} data-pid={p.id} style={{ touchAction: "pan-x" }}
                onPointerDown={(e) => trayDown(e, p.id)} onPointerMove={trayMove} onPointerUp={trayUp} onPointerCancel={trayUp}
                className={clsx("relative size-[4.5rem] shrink-0 cursor-grab select-none overflow-hidden rounded-xl bg-neutral-800 transition", selId === p.id && "ring-2 ring-gold-500", dragId === p.id && "z-10 scale-110 opacity-80 shadow-xl ring-2 ring-white")}>
                <img src={p.thumb} alt={p.name} draggable={false} className="pointer-events-none size-full object-cover" />
                <span className="absolute left-1 top-1 grid size-4 place-items-center rounded-full bg-black/60 text-[9px] font-bold">{i + 1}</span>
              </li>
            ))}
            {photos.length < MAX_PHOTOS && (
              <li className="shrink-0">
                <label className="grid size-[4.5rem] cursor-pointer place-items-center rounded-xl border border-dashed border-white/30 text-white/70 active:scale-95"><Plus className="size-6" />{fileInput}</label>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Kanan (desktop) / bawah (mobile): alat, tepat di bawah pratinjau */}
      <div className="shrink-0 border-t border-white/10 bg-neutral-900 lg:flex lg:h-full lg:flex-col lg:overflow-y-auto lg:border-l lg:border-t-0">
        {photos.length > 0 && (
          <>
            <div role="tablist" className="flex gap-1 overflow-x-auto px-2 pt-2 [scrollbar-width:none] lg:flex-wrap">
              {tools.map(({ id, t, icon: Icon }) => (
                <button key={id} role="tab" aria-selected={activeTool === id} onClick={() => setTool(id)}
                  className={clsx("flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition active:scale-95", activeTool === id ? "bg-white/15 text-gold-300" : "text-white/60 hover:text-white")}>
                  <Icon className="size-4" />{t}
                </button>
              ))}
            </div>
            <div className="max-h-[38dvh] overflow-y-auto px-4 py-3 lg:max-h-none lg:flex-1">{panel}</div>
          </>
        )}
        <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 lg:hidden">{liquidNav}</div>
      </div>

      {/* Hasil */}
      {result && createPortal(
        <div role="dialog" aria-modal className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-full w-full max-w-md flex-col gap-3 overflow-y-auto rounded-3xl bg-neutral-950 p-4 text-white">
            <button onClick={() => setResult(null)} aria-label="Tutup" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/60"><X className="size-4" /></button>
            {result.kind === "video"
              ? <video src={result.url} controls playsInline autoPlay muted loop className="mx-auto max-h-[60vh] rounded-xl" />
              : <img src={result.url} alt="Hasil" className="mx-auto max-h-[60vh] rounded-xl" />}
            <a href={result.url} download={`visuelstory-${mode}-${Date.now()}.${result.ext}`} className="flex items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-semibold text-neutral-950">
              <Download className="size-4" />Unduh ({(result.size / 1024 / 1024).toFixed(1)} MB)
            </a>
            {canShareFile(result) && <button onClick={() => share(result)} className="flex items-center justify-center gap-2 rounded-full bg-white/10 py-3 text-sm font-medium"><Share2 className="size-4" />Bagikan</button>}
            <p className="text-center text-[11px] text-white/50">Hasil tidak disimpan di server. Unduh sebelum menutup.</p>
          </div>
        </div>, document.body)}
    </div>,
    document.body
  );
}
