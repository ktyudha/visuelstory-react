import { useEffect, useState } from "react";
import { BellRing, Download, Images, MoreVertical, Plus, Share, X, Zap } from "lucide-react";
import BottomSheet from "../components/BottomSheet";
import { useInstallPrompt } from "./useInstallPrompt";

const KEYS = { banner: "install-banner-dismissed", sheet: "install-sheet-dismissed", button: "" } as const;
const DAYS = { banner: 7, sheet: 1, button: 0 } as const;
type Variant = keyof typeof KEYS;

const dismissedRecently = (v: Variant) => {
  try { return v !== "button" && Date.now() - Number(localStorage.getItem(KEYS[v]) ?? 0) < DAYS[v] * 864e5; } catch { return false; }
};
const remember = (v: Variant) => { try { localStorage.setItem(KEYS[v], String(Date.now())); } catch { /* abaikan */ } };
const isMobileUA = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent);

/** Langkah pasang manual (iOS Safari & browser tanpa tombol pasang otomatis). */
function Steps({ ios }: { ios: boolean }) {
  const rows = ios
    ? [
        [<Share key="a" className="size-5" />, <>Ketuk tombol <b>Bagikan</b> di bagian bawah Safari.</>],
        [<Plus key="b" className="size-5" />, <>Pilih <b>Tambah ke Layar Utama</b>.</>],
        [<Download key="c" className="size-5" />, <>Ketuk <b>Tambah</b>. Ikon Visuelstory muncul di layar utama.</>],
      ]
    : [
        [<MoreVertical key="a" className="size-5" />, <>Buka menu <b>⋮</b> di pojok browser.</>],
        [<Plus key="b" className="size-5" />, <>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</>],
        [<Download key="c" className="size-5" />, <>Konfirmasi. Ikon Visuelstory muncul di layar utama.</>],
      ];
  return (
    <ol className="space-y-4 text-sm">
      {rows.map(([icon, text], i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800">{icon}</span>
          <span className="pt-1.5">{text}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Ajakan pasang aplikasi.
 *  - "sheet"  : bottom sheet modal otomatis (mobile), muncul lagi tiap hari sampai dipasang
 *  - "banner" : kartu di atas halaman (desktop)
 *  - "button" : tombol saja
 */
export default function InstallApp({ variant = "banner", className = "" }: { variant?: Variant; className?: string }) {
  const { available, install, standalone, ios } = useInstallPrompt();
  const [hidden, setHidden] = useState(dismissedRecently(variant));
  const [open, setOpen] = useState(false);   // sheet / panduan
  const [steps, setSteps] = useState(false); // tampilkan langkah manual di dalam sheet

  // Sheet muncul otomatis sesaat setelah halaman siap.
  useEffect(() => {
    if (variant !== "sheet" || hidden || standalone || !isMobileUA()) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [variant, hidden, standalone]);

  if (standalone || (!available && !isMobileUA())) return null;
  if (variant !== "button" && hidden) return null;

  const dismiss = () => { remember(variant); setHidden(true); setOpen(false); };
  const act = async () => { if (available) { await install(); setOpen(false); } else { setSteps(true); setOpen(true); } };

  const primary = (
    <button onClick={act}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 active:scale-95">
      <Download className="size-4" /> Pasang aplikasi
    </button>
  );

  if (variant === "sheet") {
    if (!open) return null;
    return (
      <BottomSheet label="Pasang aplikasi" onClose={dismiss}>
        <div className="mb-4 flex items-center gap-4">
          <img src="/icons/icon-192.png" alt="" className="size-16 shrink-0 rounded-2xl shadow" />
          <div>
            <h2 className="text-lg font-bold leading-tight">Pasang aplikasi Visuelstory</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Gratis, tanpa Play Store / App Store.</p>
          </div>
        </div>

        {steps ? <Steps ios={ios} /> : (
          <ul className="space-y-3 text-sm">
            {[[Zap, "Buka lebih cepat langsung dari layar utama"], [Images, "Pilih foto & lihat galeri layar penuh"], [BellRing, "Cek jadwal dan pembayaran dalam sekali ketuk"]].map(([Icon, t], i) => {
              const I = Icon as typeof Zap;
              return <li key={i} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800"><I className="size-4" /></span>{t as string}</li>;
            })}
          </ul>
        )}

        <div className="mt-6 space-y-2">
          {!steps && (
            <button onClick={act} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-base font-semibold text-white transition active:scale-[0.98] dark:bg-white dark:text-neutral-900">
              <Download className="size-5" /> Pasang aplikasi
            </button>
          )}
          <button onClick={dismiss} className="w-full cursor-pointer rounded-xl py-3 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
            {steps ? "Tutup" : "Nanti saja"}
          </button>
        </div>
      </BottomSheet>
    );
  }

  if (variant === "button") {
    return (
      <>
        <button onClick={act} className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold transition active:scale-95 dark:border-neutral-700 ${className}`}>
          <Download className="size-4" /> Pasang aplikasi
        </button>
        {open && (
          <BottomSheet onClose={() => { setOpen(false); setSteps(false); }}>
            <h2 className="mb-4 text-lg font-bold">Cara memasang aplikasi</h2>
            <Steps ios={ios} />
            <button onClick={() => { setOpen(false); setSteps(false); }} className="mt-6 w-full cursor-pointer rounded-xl py-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Tutup</button>
          </BottomSheet>
        )}
      </>
    );
  }

  // banner (desktop)
  return (
    <>
      <div className={`mb-5 hidden items-center gap-3 rounded-2xl bg-neutral-900 p-4 text-white shadow-sm dark:bg-neutral-800 md:flex ${className}`}>
        <img src="/icons/icon-192.png" alt="" className="size-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Pasang aplikasi Visuelstory</div>
          <div className="text-xs text-white/70">Booking &amp; pilih foto lebih cepat, langsung dari layar utama.</div>
        </div>
        {primary}
        <button onClick={dismiss} aria-label="Sembunyikan" className="-mr-1 shrink-0 cursor-pointer rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
      </div>
      {open && (
        <BottomSheet onClose={() => { setOpen(false); setSteps(false); }}>
          <h2 className="mb-4 text-lg font-bold">Cara memasang aplikasi</h2>
          <Steps ios={ios} />
          <button onClick={() => { setOpen(false); setSteps(false); }} className="mt-6 w-full cursor-pointer rounded-xl py-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">Tutup</button>
        </BottomSheet>
      )}
    </>
  );
}
