import clsx from "clsx";
import type { TransactionStatus } from "@services/admin/invoice/interfaces/get-all.type";

export const STATUS: Record<TransactionStatus, { label: string; cls: string; bar: string }> = {
  unpaid: { label: "Belum dibayar", cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900", bar: "bg-red-400" },
  down_payment: { label: "DP / Cicilan", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900", bar: "bg-amber-500" },
  paid: { label: "Lunas", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900", bar: "bg-emerald-500" },
};

export function StatusPill({ status }: { status: TransactionStatus }) {
  const s = STATUS[status] ?? STATUS.unpaid;
  return (
    <span className={clsx("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1", s.cls)}>
      {s.label}
    </span>
  );
}

export function CancelPill({ status }: { status?: "requested" | "approved" | "rejected" | null }) {
  if (!status) return null;
  const m = {
    requested: ["Minta batal", "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900"],
    approved: ["Dibatalkan", "bg-gray-100 text-gray-600 ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600"],
    rejected: ["Batal ditolak", "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900"],
  }[status];
  return <span className={clsx("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1", m[1])}>{m[0]}</span>;
}

export function PaymentProgress({ paid, total, status }: { paid: number; total: number; status: TransactionStatus }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={clsx("h-full rounded-full transition-all", (STATUS[status] ?? STATUS.unpaid).bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const METHOD_LABEL: Record<string, string> = {
  transfer: "Transfer",
  cash: "Tunai",
  qris: "QRIS",
  other: "Lainnya",
};

export const panel = "rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800";
