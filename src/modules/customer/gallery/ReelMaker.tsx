import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clapperboard, Download, Film, Loader2, RotateCcw, Share2, Sparkles, X } from "lucide-react";
import clsx from "clsx";
import BottomSheet from "@components/BottomSheet";
import Logo from "@/assets/logo/logo-mark.png";
import { btnGhost } from "../shared/ui";
import { loadBitmaps, loadLogo, makeGif, makeVideo, maxPhotos, pickVideoMime, ReelCancelled, type Ratio, type ReelFormat, type ReelResult } from "./reel";

interface PhotoLite { id: string; name: string; thumb_url: string; preview_url: string }
interface Props { photos: PhotoLite[]; invoiceNumber: string; onClose: () => void }

const RATIOS: { v: Ratio; label: string; hint: string; box: string }[] = [
  { v: "9:16", label: "9:16", hint: "Story / Reels", box: "h-7 w-4" },
  { v: "1:1", label: "1:1", hint: "Feed", box: "h-5 w-5" },
  { v: "16:9", label: "16:9", hint: "Lebar", box: "h-4 w-7" },
];

export default function ReelMaker({ photos, invoiceNumber, onClose }: Props) {
  const videoMime = useMemo(() => pickVideoMime(), []);
  const [format, setFormat] = useState<ReelFormat>(videoMime ? "video" : "gif");
  const [ratio, setRatio] = useState<Ratio>("9:16");
  const [seconds, setSeconds] = useState(0.5);
  const [watermark, setWatermark] = useState(true);
  const [crop, setCrop] = useState(true); // potong otomatis mengisi bingkai
  const [picked, setPicked] = useState<string[]>(() => photos.slice(0, 10).map((p) => p.id));
  const [phase, setPhase] = useState<"config" | "working" | "done" | "error">("config");
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReelResult | null>(null);
  const ctl = useRef({ cancelled: false });

  const max = maxPhotos(format, seconds);
  const fmt = (n: number) => String(n % 1 ? n.toFixed(1) : n).replace(".", ",");
  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const chosen = picked.map((id) => byId.get(id)).filter(Boolean) as PhotoLite[];
  const overMax = chosen.length > max;
  const length = chosen.length * seconds;
  const [shareNote, setShareNote] = useState("");

  useEffect(() => () => { ctl.current.cancelled = true; if (result) URL.revokeObjectURL(result.url); }, [result]);

  useEffect(() => { setPicked((cur) => (cur.length > max ? cur.slice(0, max) : cur)); }, [max]);

  const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= max ? cur : [...cur, id]));

  const start = async () => {
    if (chosen.length < 2) return;
    ctl.current = { cancelled: false };
    setPhase("working"); setProgress(0); setError("");
    const opts = { format, ratio, seconds, watermark, crop };
    try {
      setStage(`Mengunduh foto 0/${chosen.length}`);
      const bmps = await loadBitmaps(chosen.map((p) => p.preview_url), (d) => { setStage(`Mengunduh foto ${d}/${chosen.length}`); setProgress(d / chosen.length * 0.25); }, ctl.current);
      const logo = watermark ? await loadLogo(Logo) : null;
      setStage(format === "video" ? "Merekam video — biarkan tab ini tetap terbuka" : "Menyusun GIF");
      const onP = (p: number) => setProgress(0.25 + p * 0.75);
      const res = format === "video" ? await makeVideo(bmps, logo, opts, onP, ctl.current) : await makeGif(bmps, logo, opts, onP, ctl.current);
      bmps.forEach((b) => b.close());
      setResult(res); setPhase("done");
    } catch (e) {
      if (e instanceof ReelCancelled || ctl.current.cancelled) { setPhase("config"); return; }
      setError(e instanceof Error ? e.message : "Gagal membuat. Coba lagi."); setPhase("error");
    }
  };

  const cancel = () => { ctl.current.cancelled = true; };
  const fileName = `visuelstory-${invoiceNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${result?.ext ?? "mp4"}`;
  const makeFile = () => (result ? new File([result.blob], fileName, { type: result.mime }) : null);
  const download = () => { if (!result) return; const a = document.createElement("a"); a.href = result.url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); };
  const share = async () => {
    const file = makeFile();
    if (!file) return;
    setShareNote("");
    try {
      // Berbagi file langsung (HP: WhatsApp, Instagram, dll.). Harus dipanggil langsung dari klik.
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Hasil foto Visuelstory", text: "Hasil foto dari Visuelstory" });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // pengguna menutup menu berbagi
    }
    // Cadangan: perangkat/browser belum mendukung berbagi file -> unduh, lalu kirim manual.
    download();
    setShareNote("Browser ini belum bisa membagikan file langsung. File sudah diunduh — buka WhatsApp/Instagram lalu pilih file tersebut.");
  };
  const again = () => { if (result) URL.revokeObjectURL(result.url); setResult(null); setPhase("config"); };

  return (
    <BottomSheet label="Buat video atau GIF" onClose={() => { cancel(); onClose(); }}>
      {phase === "config" && (
        <div className="space-y-5 pb-2">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-600 text-neutral-950"><Film className="size-5" /></span>
            <div>
              <h2 className="text-lg font-bold leading-tight">Buat video / GIF</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Ubah foto hasil editan jadi slideshow cepat untuk dibagikan. Dibuat langsung di perangkat Anda.</p>
            </div>
          </div>

          <Group label="Format">
            <div className="grid grid-cols-2 gap-2">
              <Choice on={format === "video"} disabled={!videoMime} onClick={() => setFormat("video")} title="Video" sub={videoMime ? (videoMime.includes("mp4") ? "MP4 • terbaik" : "WebM • terbaik") : "Tidak didukung"} icon={<Clapperboard className="size-4" />} />
              <Choice on={format === "gif"} onClick={() => setFormat("gif")} title="GIF" sub="Ringan" icon={<Sparkles className="size-4" />} />
            </div>
          </Group>

          <Group label="Rasio">
            <div className="grid grid-cols-3 gap-2">
              {RATIOS.map((r) => (
                <button key={r.v} type="button" onClick={() => setRatio(r.v)} aria-pressed={ratio === r.v}
                  className={clsx("flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-xs font-medium transition", ratio === r.v ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800" : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700")}>
                  <span className="grid h-8 place-items-center"><span className={clsx("rounded-sm border-2 border-current", r.box)} /></span>
                  <span className="font-semibold leading-none">{r.label}</span><span className="leading-none text-neutral-500 dark:text-neutral-400">{r.hint}</span>
                </button>
              ))}
            </div>
          </Group>

          <Group label="Kecepatan slide (tiap foto)">
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 3].map((s) => (
                <button key={s} type="button" onClick={() => setSeconds(s)} aria-pressed={seconds === s}
                  className={clsx("h-11 cursor-pointer rounded-xl border-2 text-sm font-semibold transition", seconds === s ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700")}>{fmt(s)} dtk</button>
              ))}
            </div>
          </Group>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
            <span><span className="block font-medium">Potong otomatis sesuai rasio</span><span className="text-xs text-neutral-500 dark:text-neutral-400">{crop ? "Foto mengisi penuh bingkai, tepinya terpotong" : "Foto utuh, sisi kosong diberi latar blur"}</span></span>
            <input type="checkbox" checked={crop} onChange={(e) => setCrop(e.target.checked)} className="size-5 accent-neutral-900 dark:accent-white" />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
            <span><span className="block font-medium">Logo Visuelstory</span><span className="text-xs text-neutral-500 dark:text-neutral-400">Tampil kecil di pojok kanan bawah</span></span>
            <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} className="size-5 accent-neutral-900 dark:accent-white" />
          </label>

          <Group label={`Pilih foto (${chosen.length}/${max})`} aside={
            <span className="flex gap-3 text-xs">
              <button type="button" onClick={() => setPicked(photos.slice(0, max).map((p) => p.id))} className="cursor-pointer font-medium underline underline-offset-4">Pilih semua{photos.length > max ? ` (${max})` : ""}</button>
              <button type="button" onClick={() => setPicked([])} className="cursor-pointer text-neutral-500 underline underline-offset-4">Kosongkan</button>
            </span>}>
            <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">Urutan mengikuti urutan Anda mengetuk.</p>
            <div className="grid grid-cols-4 gap-1.5">
              {photos.map((p) => {
                const n = picked.indexOf(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-pressed={n >= 0} aria-label={`${p.name}${n >= 0 ? `, urutan ${n + 1}` : ""}`}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                    <img src={p.thumb_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {n >= 0 && <span className="absolute inset-0 bg-black/20 shadow-[inset_0_0_0_3px_#171717,inset_0_0_0_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_0_0_3px_#fff,inset_0_0_0_5px_rgba(0,0,0,0.55)]" />}
                    {n >= 0 && <span className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">{n + 1}</span>}
                  </button>
                );
              })}
            </div>
          </Group>

          <div className="sticky bottom-0 -mx-6 border-t border-neutral-200 bg-white px-6 pb-1 pt-3 dark:border-neutral-800 dark:bg-neutral-900">
            <button onClick={start} disabled={chosen.length < 2 || overMax}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 to-amber-500 text-base font-bold text-neutral-950 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
              <Sparkles className="size-5" /> Buat {format === "video" ? "video" : "GIF"}{chosen.length >= 2 ? ` • ±${fmt(length)} detik` : ""}
            </button>
            {chosen.length < 2 && <p className="mt-1.5 text-center text-xs text-neutral-500">Pilih minimal 2 foto.</p>}
          </div>
        </div>
      )}

      {phase === "working" && (
        <div className="space-y-5 py-8 text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-amber-500" />
          <div>
            <div className="font-semibold">{stage}</div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{format === "video" ? "Video direkam secara langsung, jadi lama prosesnya sama dengan panjang videonya. Jangan pindah tab." : "Mohon tunggu sebentar."}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <button onClick={cancel} className={btnGhost}><X className="size-4" /> Batal</button>
        </div>
      )}

      {phase === "done" && result && (
        <div className="space-y-4 pb-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400"><Check className="size-5" /><h2 className="text-lg font-bold">Selesai!</h2></div>
          <div className="grid place-items-center rounded-2xl bg-black p-2">
            {result.ext === "gif"
              ? <img src={result.url} alt="Hasil GIF" className="max-h-[52vh] max-w-full rounded-lg" />
              : <video src={result.url} controls autoPlay loop muted playsInline className="max-h-[52vh] max-w-full rounded-lg" />}
          </div>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">{result.ext.toUpperCase()} • {result.blob.size < 1048576 ? `${Math.max(1, Math.round(result.blob.size / 1024))} KB` : `${(result.blob.size / 1048576).toFixed(1)} MB`}</p>
          <div className="grid gap-2">
            <a href={result.url} download={fileName} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-base font-bold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"><Download className="size-5" /> Unduh</a>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={share} className={`${btnGhost} h-11`}><Share2 className="size-4" /> Bagikan</button>
              <button onClick={again} className={`${btnGhost} h-11`}><RotateCcw className="size-4" /> Buat lagi</button>
            </div>
            {shareNote && <p role="status" className="rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{shareNote}</p>}
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-4 py-6 text-center">
          <p className="font-semibold text-red-600 dark:text-red-400">Belum berhasil</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{error}</p>
          <div className="flex justify-center gap-2"><button onClick={() => setPhase("config")} className={btnGhost}>Kembali</button><button onClick={start} className="inline-flex h-11 cursor-pointer items-center rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">Coba lagi</button></div>
        </div>
      )}
    </BottomSheet>
  );
}

function Group({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{label}</span>{aside}</div>{children}</div>;
}

function Choice({ on, disabled, onClick, title, sub, icon }: { on: boolean; disabled?: boolean; onClick: () => void; title: string; sub: string; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={on}
      className={clsx("flex cursor-pointer items-center gap-2.5 rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40", on ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800" : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700")}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">{icon}</span>
      <span className="min-w-0"><span className="block text-sm font-semibold leading-tight">{title}</span><span className="block text-xs leading-snug text-neutral-500 dark:text-neutral-400">{sub}</span></span>
    </button>
  );
}
