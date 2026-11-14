import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { mutate as globalMutate } from "swr";
import {
  AlarmClock, ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, Heart, Lock, RotateCw, X,
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import BottomSheet from "@components/BottomSheet";
import { timeLeft } from "@helpers/deadline";
import { getApiError, saveSelection, saveSelectionKeepalive, submitSelection, useGallery } from "@services/customer/api";
import type { Photo } from "@services/customer/types";
import { ADMIN_WHATSAPP, btnGhost, btnPrimary, Card, ErrorState, inputCls, Spinner } from "../shared/ui";
import { useSelectionSync } from "./useSelectionSync";

const PAGE = 60;

export default function Gallery() {
  const { orderId = "" } = useParams();
  const { gallery, error, loading, validating, retry, mutate } = useGallery(orderId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "selected">("all");
  const [visible, setVisible] = useState(PAGE);
  const [lb, setLb] = useState<{ photos: Photo[]; index: number } | null>(null); // lightbox memegang salinan daftar
  const [confirm, setConfirm] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [sentSheet, setSentSheet] = useState(false); // bottom sheet 'terkirim', hanya sekali setelah mengirim
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const hydrated = useRef(false);
  const clockOffset = useRef(0); // selisih jam server - jam perangkat

  // Salinan terbaru untuk dipakai di callback tanpa menjadi efek samping di dalam updater state.
  const selRef = useRef(selected); selRef.current = selected;
  const noteRef = useRef(note); noteRef.current = note;

  // Ambil status dari server SEKALI per kunjungan, dan hanya setelah data terbaru tiba (bukan cache lama).
  useEffect(() => {
    if (!gallery || validating || hydrated.current) return;
    hydrated.current = true;
    clockOffset.current = dayjs(gallery.now).valueOf() - Date.now();
    setSelected(new Set(gallery.photos.filter((p) => p.selected).map((p) => p.id)));
    setNote(gallery.note ?? "");
    setSubmittedAt(gallery.submitted_at);
  }, [gallery, validating]);

  // Hitung mundur tenggat (pakai jam server) — diperbarui tiap 30 detik.
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 30000); return () => clearInterval(t); }, []);
  const nowAdj = useMemo(() => Date.now() + clockOffset.current, [tick, gallery]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = timeLeft(gallery?.deadline_at, nowAdj);
  const closed = Boolean(gallery?.closed) || Boolean(left?.closed);
  const locked = Boolean(submittedAt) || closed;
  const limit = gallery?.selection_limit ?? null;
  const over = limit !== null && selected.size > limit;

  // Simpan otomatis: berurutan, ada retry, dan tetap terkirim saat halaman ditutup.
  const sync = useSelectionSync({
    save: async ({ ids, note: n }) => { await saveSelection(orderId, ids, n); },
    isFatal: (e) => isAxiosError(e) && [401, 403, 404, 422].includes(e.response?.status ?? 0),
    onFatal: (e) => {
      toast.error(getApiError(e), { toastId: "sync-fatal" });
      hydrated.current = false; // muat ulang status asli dari server (mungkin sudah terkunci)
      void mutate();
    },
    keepalive: ({ ids, note: n }) => saveSelectionKeepalive(orderId, ids, n),
  });

  const persist = useCallback((next: Set<string>, n: string) => sync.schedule({ ids: [...next], note: n }), [sync]);

  const toggle = useCallback((id: string) => {
    if (locked) return;
    const next = new Set(selRef.current);
    if (next.has(id)) next.delete(id);
    else {
      if (limit && next.size >= limit) { toast.warn(`Maksimal ${limit} foto yang dapat dipilih.`, { toastId: "limit" }); return; }
      next.add(id);
    }
    setSelected(next);
    persist(next, noteRef.current);
  }, [locked, limit, persist]);

  const clearAll = () => { const empty = new Set<string>(); setSelected(empty); persist(empty, noteRef.current); setConfirmClear(false); };

  const photos = useMemo(() => gallery?.photos ?? [], [gallery]);
  const list = useMemo(() => (filter === "selected" ? photos.filter((p) => selected.has(p.id)) : photos), [photos, filter, selected]);

  // Link foto bertanda tangan bisa kedaluwarsa: muat ulang daftar (tanpa menyentuh pilihan), maksimal 1x/20 dtk.
  const lastRefresh = useRef(0);
  const onImgError = useCallback(() => {
    if (Date.now() - lastRefresh.current < 20000) return;
    lastRefresh.current = Date.now();
    void mutate();
  }, [mutate]);

  // Lightbox
  useEffect(() => {
    if (!lb) return;
    const move = (d: number) => setLb((s) => (s ? { ...s, index: Math.min(Math.max(s.index + d, 0), s.photos.length - 1) } : s));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === " ") { e.preventDefault(); const p = lb.photos[lb.index]; if (p) toggle(p.id); }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, toggle]);

  const submit = async () => {
    setBusy(true);
    try {
      await sync.flush(); // pastikan pilihan terakhir sudah tersimpan
      const { data } = await submitSelection(orderId);
      sync.stop();
      setSubmittedAt(data.data.submitted_at);
      setConfirm(false);
      setSentSheet(true);
      void mutate();
      void globalMutate((k) => typeof k === "string" && k.startsWith("/customer/invoices")); // segarkan daftar & detail pesanan
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e instanceof Error && e.message === "save-failed" ? "Pilihan belum tersimpan. Periksa koneksi, lalu coba lagi." : getApiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading || (gallery && validating && !hydrated.current)) return <Spinner label="Memuat foto..." />;
  if (error || !gallery) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return <ErrorState message={status === 404 ? "Foto untuk pesanan ini belum tersedia." : status === 403 ? "Foto tersedia setelah pembayaran DP/lunas." : "Foto gagal dimuat."} onRetry={() => retry()} />;
  }

  const cur = lb ? lb.photos[lb.index] : undefined;
  const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Halo Visuelstory, saya ingin menanyakan pilihan foto untuk pesanan ${gallery.invoice_number}.`)}`;

  return (
    <div className="pb-32">
      <Metadata title="Galeri Foto" />
      <Link to={`/account/orders/${orderId}`} className="mb-4 hidden items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:inline-flex">
        <ArrowLeft className="size-4" /> Detail pesanan
      </Link>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Galeri Foto</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{gallery.invoice_number} • {photos.length} foto</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {gallery.edited_ready && <Link to={`/account/orders/${orderId}/edited`} className={btnPrimary}>Lihat hasil editan</Link>}
          {gallery.folder_url && <a href={gallery.folder_url} target="_blank" rel="noreferrer" className={btnGhost}><ExternalLink className="size-4" /> Buka folder Drive</a>}
        </div>
      </div>

      {/* Status / tenggat */}
      {submittedAt ? (
        <div className="my-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <span className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="size-4 shrink-0" /> Pilihan terkirim • {selected.size} foto</span>
          <span className="text-emerald-900/70 dark:text-emerald-200/70">{dayjs(submittedAt).locale("id").format("D MMM, HH:mm")}</span>
          <a href={waLink} target="_blank" rel="noreferrer" className="ml-auto text-emerald-800 underline underline-offset-4 dark:text-emerald-300">Perlu perubahan?</a>
        </div>
      ) : closed ? (
        <Card className="my-5 flex items-start gap-3 p-4">
          <Lock className="mt-0.5 size-5 shrink-0 text-neutral-500" />
          <div className="text-sm">
            <div className="font-semibold">Batas waktu pemilihan sudah berakhir</div>
            <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
              {selected.size > 0 ? `${selected.size} foto yang Anda pilih diteruskan ke tim kami untuk diedit.` : "Anda belum memilih foto. Hubungi kami jika ingin meminta perpanjangan waktu."}
            </p>
            <a href={waLink} target="_blank" rel="noreferrer" className={`${btnGhost} mt-3`}>Hubungi kami</a>
          </div>
        </Card>
      ) : (
        <Card className={clsx("my-5 p-4 text-sm", left?.urgent && "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30")}>
          {left && (
            <div className={clsx("mb-2 flex items-center gap-2 font-semibold", left.urgent ? "text-amber-800 dark:text-amber-300" : "")}>
              <AlarmClock className="size-4" /> Pilih sebelum {left.date} <span className="font-normal opacity-80">• {left.label}</span>
            </div>
          )}
          <p className="text-neutral-600 dark:text-neutral-300">
            Ketuk <Heart className="-mt-0.5 inline size-4" /> pada foto yang ingin <b>diedit</b>{limit ? <> (maksimal <b>{limit}</b> foto)</> : null}. Pilihan tersimpan otomatis dan masih bisa diubah sampai tenggat. Klik foto untuk memperbesar.
          </p>
        </Card>
      )}

      {over && !locked && (
        <Card className="mb-5 border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          Batas pilihan sekarang <b>{limit}</b> foto, sedangkan Anda memilih <b>{selected.size}</b>. Kurangi <b>{selected.size - (limit ?? 0)}</b> foto sebelum mengirim.
        </Card>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["all", "selected"] as const).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setVisible(PAGE); }}
            className={clsx("cursor-pointer rounded-full border px-4 py-1.5 text-sm",
              filter === f ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800")}>
            {f === "all" ? `Semua (${photos.length})` : `Dipilih (${selected.size})`}
          </button>
        ))}
        {!locked && selected.size > 0 && (confirmClear ? (
          <span className="ml-auto flex items-center gap-2 text-sm">
            Kosongkan semua pilihan?
            <button onClick={clearAll} className="cursor-pointer font-semibold text-red-600 dark:text-red-400">Ya</button>
            <button onClick={() => setConfirmClear(false)} className="cursor-pointer text-neutral-500">Batal</button>
          </span>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="ml-auto cursor-pointer text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">Kosongkan pilihan</button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-neutral-500 dark:text-neutral-400">{filter === "selected" ? "Belum ada foto yang dipilih." : "Folder masih kosong."}</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {list.slice(0, visible).map((p, idx) => {
            const on = selected.has(p.id);
            return (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                <button type="button" onClick={() => setLb({ photos: list, index: idx })} className="absolute inset-0 h-full w-full cursor-zoom-in" aria-label={`Perbesar ${p.name}`}>
                  <img src={p.thumb_url} alt={p.name} loading="lazy" decoding="async" onError={onImgError} className="h-full w-full object-cover transition group-hover:scale-105" />
                </button>
                {/* Garis terpilih DI DALAM kotak (inset): tidak keluar ke tetangga sehingga tidak saling menumpuk */}
                {on && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-black/10 shadow-[inset_0_0_0_3px_#171717,inset_0_0_0_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_0_0_3px_#ffffff,inset_0_0_0_5px_rgba(0,0,0,0.55)]" />}
                <button type="button" onClick={() => toggle(p.id)} disabled={locked} aria-pressed={on} aria-label={on ? "Batal pilih" : "Pilih untuk diedit"}
                  className={clsx("absolute right-2 top-2 grid size-9 cursor-pointer place-items-center rounded-full shadow transition disabled:cursor-default",
                    on ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-white/90 text-neutral-700 hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-100", locked && !on && "opacity-0")}>
                  {on ? <Check className="size-4" /> : <Heart className="size-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {visible < list.length && <div className="mt-6 text-center"><button onClick={() => setVisible((v) => v + PAGE)} className={btnGhost}>Tampilkan lebih banyak ({list.length - visible})</button></div>}

      {/* Bar aksi */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm">
            <b>{selected.size}</b>{limit ? ` / ${limit}` : ""} foto dipilih
            {!locked && sync.status !== "idle" && (
              <span className="ml-2 text-xs">
                {sync.status === "saving" || sync.status === "pending" ? <span className="text-neutral-500 dark:text-neutral-400">Menyimpan...</span>
                  : sync.status === "saved" ? <span className="text-emerald-600 dark:text-emerald-400">Tersimpan ✓</span>
                  : <button onClick={sync.retry} className="inline-flex cursor-pointer items-center gap-1 font-medium text-red-600 dark:text-red-400"><RotateCw className="size-3" /> Belum tersimpan • Coba lagi</button>}
              </span>
            )}
          </div>
          {submittedAt ? <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"><Check className="size-4" /> Terkirim</span>
            : closed ? <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-500"><Lock className="size-4" /> Tenggat berakhir</span>
            : <button className={btnPrimary} disabled={selected.size === 0 || over} onClick={() => setConfirm(true)}>Kirim pilihan</button>}
        </div>
      </div>

      {/* Terkirim: bottom sheet modal, tampil sekali setelah mengirim, bisa ditutup */}
      {sentSheet && (
        <BottomSheet label="Pilihan terkirim" onClose={() => setSentSheet(false)}>
          <div className="space-y-4 pb-1 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><CheckCircle2 className="size-8" /></span>
            <div>
              <h2 className="text-xl font-bold">Pilihan terkirim!</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300"><b>{selected.size} foto</b> sudah kami terima. Tim kami akan mengedit foto pilihan Anda, dan hasilnya muncul di halaman detail pesanan.</p>
            </div>
            <div className="grid gap-2">
              <Link to={`/account/orders/${orderId}`} className={`${btnPrimary} h-12 text-base`}>Kembali ke pesanan</Link>
              <button onClick={() => setSentSheet(false)} className={`${btnGhost} h-11`}>Tutup</button>
            </div>
            <a href={waLink} target="_blank" rel="noreferrer" className="inline-block text-xs text-neutral-500 underline underline-offset-4 dark:text-neutral-400">Perlu perubahan? Hubungi kami</a>
          </div>
        </BottomSheet>
      )}

      {/* Konfirmasi kirim */}
      {confirm && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-1 text-lg font-bold">Kirim {selected.size} foto untuk diedit?</h2>
            <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
              Setelah dikirim, pilihan tidak bisa diubah sendiri.{left && !left.closed ? ` Anda sebenarnya masih bisa memilih sampai ${left.date}; mengirim sekarang membuat tim kami bisa mulai mengedit lebih cepat.` : ""}
            </p>
            <label className="mb-5 block text-sm">
              <span className="mb-1.5 block font-medium">Catatan untuk editor <span className="font-normal text-neutral-400 dark:text-neutral-500">(opsional)</span></span>
              <textarea rows={3} maxLength={2000} value={note} onChange={(e) => { setNote(e.target.value); persist(selRef.current, e.target.value); }}
                placeholder="Mis. skin tone natural, hilangkan objek di background..." className={inputCls} />
            </label>
            <div className="flex justify-end gap-2">
              <button className={btnGhost} onClick={() => setConfirm(false)} disabled={busy}>Batal</button>
              <button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? "Mengirim..." : "Ya, kirim"}</button>
            </div>
          </Card>
        </div>
      )}

      {/* Lightbox */}
      {lb && cur && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={cur.name}>
          <div className="flex items-center justify-between p-3 text-white">
            <span className="truncate pr-4 text-sm">{cur.name} <span className="text-white/50">({lb.index + 1}/{lb.photos.length})</span></span>
            <div className="flex items-center gap-1">
              <a href={cur.download_url} className="rounded-lg p-2.5 hover:bg-white/10" aria-label="Unduh foto asli" title="Unduh foto asli"><Download className="size-5" /></a>
              <button onClick={() => setLb(null)} className="cursor-pointer rounded-lg p-2.5 hover:bg-white/10" aria-label="Tutup"><X className="size-5" /></button>
            </div>
          </div>
          <div className="relative grid min-h-0 flex-1 place-items-center px-2" onClick={() => setLb(null)}>
            <img key={cur.id} src={cur.preview_url} alt={cur.name} onError={onImgError} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full select-none object-contain" />
            {lb.index > 0 && <button onClick={(e) => { e.stopPropagation(); setLb({ ...lb, index: lb.index - 1 }); }} aria-label="Sebelumnya" className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white hover:bg-black/70"><ChevronLeft className="size-6" /></button>}
            {lb.index < lb.photos.length - 1 && <button onClick={(e) => { e.stopPropagation(); setLb({ ...lb, index: lb.index + 1 }); }} aria-label="Berikutnya" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white hover:bg-black/70"><ChevronRight className="size-6" /></button>}
          </div>
          <div className="flex justify-center p-4">
            <button onClick={() => toggle(cur.id)} disabled={locked}
              className={clsx("inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60",
                selected.has(cur.id) ? "bg-white text-neutral-900" : "bg-neutral-800 text-white hover:bg-neutral-700")}>
              {selected.has(cur.id) ? <><Check className="size-4" /> Dipilih untuk diedit</> : <><Heart className="size-4" /> Pilih untuk diedit</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
