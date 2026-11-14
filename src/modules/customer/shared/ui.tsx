import { Loader2 } from "lucide-react";
import clsx from "clsx";
import type { TransactionStatus } from "@services/customer/types";

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
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white text-sm cursor-pointer dark:text-neutral-900">
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

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm", className)} {...props} />;
}

export const inputCls =
  "w-full min-w-0 max-w-full appearance-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer dark:text-neutral-900";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition cursor-pointer";

export const ADMIN_WHATSAPP = "6285848250548";
