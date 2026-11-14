import { useState } from "react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { reviewCancellation } from "@services/admin/invoice/hooks/useCancellation";
import type { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { CancelPill, panel } from "../../shared/invoice-ui";

/** Pengajuan pembatalan dari customer: tinjau lalu setujui / tolak. */
export default function CancelPanel({ invoice }: { invoice: Invoice }) {
  const c = invoice.cancel;
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  if (!c?.status) return null;

  const act = async (action: "approve" | "reject") => {
    setBusy(action);
    try {
      await reviewCancellation(invoice.id, action, note.trim());
      toast.success(action === "approve" ? "Pembatalan disetujui. Jadwal dibuka kembali." : "Pengajuan ditolak.");
      setNote("");
    } catch (e) {
      toast.error(isAxiosError(e) ? e.response?.data?.message ?? "Gagal memproses." : "Gagal memproses.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={`${panel} print:hidden ${c.status === "requested" ? "!border-amber-300 dark:!border-amber-500/40" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Pembatalan</h2>
        <CancelPill status={c.status} />
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-200">“{c.reason}”</p>
      <p className="mt-1 text-xs text-gray-500">Diajukan {c.requested_at ? dayjs(c.requested_at).format("D MMM YYYY • HH:mm") : "-"}</p>

      {c.status === "requested" ? (
        <>
          <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan untuk customer (opsional)"
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => act("reject")} disabled={!!busy} className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700">{busy === "reject" ? "..." : "Tolak"}</button>
            <button onClick={() => act("approve")} disabled={!!busy} className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{busy === "approve" ? "..." : "Setujui batal"}</button>
          </div>
          {invoice.amount_paid > 0 && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Customer sudah membayar Rp {invoice.amount_paid.toLocaleString("id-ID")}. Pengembalian dana diurus manual.</p>}
        </>
      ) : (
        c.admin_note && <p className="mt-2 text-sm text-gray-500">Catatan Anda: “{c.admin_note}”</p>
      )}
    </section>
  );
}
