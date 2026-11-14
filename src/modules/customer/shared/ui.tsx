import { Loader2 } from "lucide-react";
import clsx from "clsx";
import type { CancelStatus, TransactionStatus } from "@services/customer/types";

export function Spinner({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-neutral-500 dark:text-neutral-400" role="status">
      <Loader2 className="size-5 animate-spin" /> <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-neutral-600 dark:text-neutral-300 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-gold-500 text-neutral-950 text-sm font-medium cursor-pointer">
          Coba lagi
        </button>
      )}
    </div>
  );
}

const statusMap: Record<TransactionStatus, { label: string; cls: string }> = {
  unpaid: { label: "Belum dibayar", cls: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-900" },
  down_payment: { label: "DP dibayar", cls: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-900" },
  paid: { label: "Lunas", cls: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-900" },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const s = statusMap[status] ?? statusMap.unpaid;
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", s.cls)}>
      {s.label}
    </span>
  );
}

const cancelMap: Record<Exclude<CancelStatus, null>, { label: string; cls: string }> = {
  requested: { label: "Pembatalan diajukan", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900" },
  approved: { label: "Dibatalkan", cls: "bg-neutral-100 text-neutral-600 ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700" },
  rejected: { label: "Pembatalan ditolak", cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900" },
};

/** Badge status pembatalan; tidak menampilkan apa pun bila tidak ada pengajuan. */
export function CancelBadge({ status }: { status?: CancelStatus }) {
  if (!status) return null;
  const s = cancelMap[status];
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", s.cls)}>{s.label}</span>;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm max-md:rounded-[18px] max-md:border-0 max-md:shadow-none", className)} {...props} />;
}

export const inputCls =
  "w-full min-w-0 max-w-full appearance-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500";

/**
 * Sistem tombol (tinggi & sudut seragam):
 *  btnPrimary    aksi utama (emas)           btnGhost      aksi sekunder (outline)
 *  btnDangerSoft aksi berisiko (merah muda)  btnDangerSolid konfirmasi berisiko (merah penuh)
 */
const btnBase =
  "inline-flex h-12 md:h-11 items-center justify-center gap-2 rounded-xl max-md:rounded-[14px] px-5 text-sm font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export const btnPrimary = `${btnBase} bg-gold-500 text-neutral-950 hover:bg-gold-400`;

export const btnGhost = `${btnBase} border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800`;

export const btnDangerSoft = `${btnBase} bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60`;

export const btnDangerSolid = `${btnBase} bg-red-600 text-white hover:bg-red-700`;

export const ADMIN_WHATSAPP = "6285144920131";
