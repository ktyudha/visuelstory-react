import { Link } from "react-router-dom";
import { AlarmClock, Check, Clapperboard, Film, Images, Sparkles } from "lucide-react";
import clsx from "clsx";
import { timeLeft } from "@helpers/deadline";
import type { Order } from "@services/customer/types";

const gold = "bg-gradient-to-r from-amber-200 to-amber-500 text-neutral-950 shadow-sm hover:brightness-105";
const primaryBase = "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold transition active:scale-[0.98]";
const secondary = "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm font-medium transition hover:bg-neutral-100 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800";

/** Status ringkas + satu tombol utama sesuai tahap + tombol pendukung. */
export default function OrderActions({ order: o }: { order: Order }) {
  const d = o.delivery;
  const left = timeLeft(d?.selection.deadline_at);
  const picking = o.gallery_ready && !o.selection_submitted_at && !d?.selection.closed;

  const chips = [
    o.gallery_ready && { label: "Foto siap", icon: Images, tone: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
    o.edited_ready && { label: "Editan siap", icon: Sparkles, tone: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
    o.video_url && { label: "Video siap", icon: Clapperboard, tone: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300" },
  ].filter(Boolean) as { label: string; icon: typeof Images; tone: string }[];

  // Detail pesanan diakses dengan mengetuk bagian atas kartu, jadi tidak perlu tombol sendiri.
  const secondaries: React.ReactNode[] = [];
  if (o.edited_ready) secondaries.push(<Link to={`/account/orders/${o.id}/edited?reel=1`} className={secondary}><Film className="size-4" /> Buat video / GIF</Link>);
  if (o.edited_ready && o.gallery_ready) secondaries.push(<Link to={`/account/orders/${o.id}/gallery`} className={secondary}><Images className="size-4" /> Foto asli</Link>);
  if (o.video_url && /^https?:\/\//i.test(o.video_url)) secondaries.push(<a href={o.video_url} target="_blank" rel="noopener noreferrer" className={secondary}><Clapperboard className="size-4" /> Tonton video</a>);

  // Tidak ada aksi apa pun? Kartu cukup bisa diketuk.
  if (chips.length === 0 && !o.edited_ready && !o.gallery_ready) return null;

  return (
    <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(({ label, icon: Icon, tone }) => (
            <span key={label} className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tone)}><Icon className="size-3.5" /> {label}</span>
          ))}
        </div>
      )}

      {/* Tombol utama */}
      {o.edited_ready ? (
        <Link to={`/account/orders/${o.id}/edited`} className={clsx(primaryBase, gold)}><Sparkles className="size-5" /> Lihat hasil editan</Link>
      ) : picking ? (
        <div>
          <Link to={`/account/orders/${o.id}/gallery`} className={clsx(primaryBase, "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200")}><Images className="size-5" /> Pilih foto</Link>
          {left && !left.closed && (
            <p className={clsx("mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium", left.urgent ? "text-amber-700 dark:text-amber-300" : "text-neutral-500 dark:text-neutral-400")}>
              <AlarmClock className="size-3.5 shrink-0" /> <span>Batas {left.short} · {left.label}</span>
            </p>
          )}
        </div>
      ) : o.gallery_ready ? (
        <Link to={`/account/orders/${o.id}/gallery`} className={clsx(primaryBase, "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200")}>
          {o.selection_submitted_at ? <Check className="size-5" /> : <Images className="size-5" />} {o.selection_submitted_at ? "Pilihan terkirim • Lihat foto" : "Lihat foto"}
        </Link>
      ) : null}

      {/* Tombol pendukung: 2 kolom; bila ganjil, yang terakhir selebar penuh */}
      {secondaries.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {secondaries.map((el, i) => (
            <div key={i} className={clsx("contents", i === secondaries.length - 1 && secondaries.length % 2 === 1 && "[&>*]:col-span-2")}>{el}</div>
          ))}
        </div>
      )}
    </div>
  );
}
