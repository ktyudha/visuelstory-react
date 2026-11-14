import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, Film, Images, X } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import { useEditedGallery } from "@services/customer/api";
import { btnGhost, Card, ErrorState, Spinner } from "../shared/ui";
import ReelMaker from "./ReelMaker";

const PAGE = 60;

/** Hasil editan yang sudah dikirim admin: lihat & unduh (tidak ada pemilihan). */
export default function EditedGallery() {
  const { orderId } = useParams();
  const { gallery, error, loading, retry } = useEditedGallery(orderId);
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const [params, setParams] = useSearchParams();
  const reelOpen = params.get("reel") === "1"; // bisa dibuka langsung dari daftar pesanan
  const setReel = (v: boolean) => setParams(v ? { reel: "1" } : {}, { replace: true });

  const photos = gallery?.photos ?? [];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : Math.min(i + 1, photos.length - 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : Math.max(i - 1, 0)));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, photos.length]);

  if (loading) return <Spinner label="Memuat hasil editan..." />;
  if (error || !gallery)
    return <ErrorState message={(error as { response?: { status?: number } })?.response?.status === 404 ? "Hasil editan belum dikirim." : "Hasil editan gagal dimuat."} onRetry={() => retry()} />;

  const cur = open !== null ? photos[open] : undefined;

  return (
    <div className="pb-28">
      <Metadata title="Hasil Editan" />
      <Link to={`/account/orders/${orderId}`} className="mb-4 hidden items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:inline-flex">
        <ArrowLeft className="size-4" /> Detail pesanan
      </Link>

      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Hasil Editan</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{gallery.invoice_number} • {photos.length} foto</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Dikirim {dayjs(gallery.delivered_at).locale("id").format("D MMM YYYY")}</p>
        </div>
        <Link to={`/account/orders/${orderId}/gallery`} className={`${btnGhost} h-10 shrink-0 !px-3`}><Images className="size-4" /> Semua foto</Link>
      </div>

      <Card className="my-5 p-4 text-sm text-neutral-600 dark:text-neutral-300">
        Ketuk foto untuk memperbesar. Gunakan tombol <Download className="-mt-0.5 inline size-4" /> untuk mengunduh satu foto, atau <b>Unduh semua</b> untuk seluruh folder.
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.slice(0, visible).map((p, i) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
            <button type="button" onClick={() => setOpen(i)} className="absolute inset-0 h-full w-full cursor-zoom-in" aria-label={`Perbesar ${p.name}`}>
              <img src={p.thumb_url} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition group-hover:scale-105" />
            </button>
            <a href={p.download_url} aria-label={`Unduh ${p.name}`} className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-white/90 text-neutral-800 shadow hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-100">
              <Download className="size-4" />
            </a>
          </div>
        ))}
      </div>
      {visible < photos.length && <div className="mt-6 text-center"><button onClick={() => setVisible((v) => v + PAGE)} className={btnGhost}>Tampilkan lebih banyak ({photos.length - visible})</button></div>}

      {/* Bar aksi tetap di bawah */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] gap-2 px-4 py-3 sm:grid-cols-[1fr_1fr] sm:max-w-xl">
          <button onClick={() => setReel(true)} disabled={photos.length < 2} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 to-amber-500 px-4 text-base font-bold text-neutral-950 shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40">
            <Film className="size-5" /> Buat video / GIF
          </button>
          {gallery.folder_url && (
            <a href={gallery.folder_url} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold transition hover:bg-neutral-100 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800" aria-label="Unduh semua di Google Drive">
              <ExternalLink className="size-4" /> <span>Unduh semua</span>
            </a>
          )}
        </div>
      </div>

      {reelOpen && photos.length >= 2 && <ReelMaker photos={photos} invoiceNumber={gallery.invoice_number} onClose={() => setReel(false)} />}

      {cur && open !== null && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={cur.name}>
          <div className="flex items-center justify-between p-3 text-white">
            <span className="truncate pr-4 text-sm">{cur.name} <span className="text-white/50">({open + 1}/{photos.length})</span></span>
            <div className="flex items-center gap-1">
              <a href={cur.download_url} className="rounded-lg p-2.5 hover:bg-white/10" aria-label="Unduh foto"><Download className="size-5" /></a>
              <button onClick={() => setOpen(null)} className="cursor-pointer rounded-lg p-2.5 hover:bg-white/10" aria-label="Tutup"><X className="size-5" /></button>
            </div>
          </div>
          <div className="relative grid min-h-0 flex-1 place-items-center px-2" onClick={() => setOpen(null)}>
            <img key={cur.id} src={cur.preview_url} alt={cur.name} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full select-none object-contain" />
            {open > 0 && <button onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }} aria-label="Sebelumnya" className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white hover:bg-black/70"><ChevronLeft className="size-6" /></button>}
            {open < photos.length - 1 && <button onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }} aria-label="Berikutnya" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white hover:bg-black/70"><ChevronRight className="size-6" /></button>}
          </div>
        </div>
      )}
    </div>
  );
}
