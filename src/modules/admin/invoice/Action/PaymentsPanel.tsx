import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { HiCheck, HiOutlineClock, HiOutlineTrash, HiPlus } from "react-icons/hi";
import DateTimeInput from "@components/DateTimeInput";
import { formattedCurrency } from "@helpers/currency";
import { addPayment, removePayment } from "@services/admin/invoice/hooks/usePayments";
import type { Invoice, Payment } from "@services/admin/invoice/interfaces/get-all.type";
import { METHOD_LABEL, panel, PaymentProgress, StatusPill } from "../../shared/invoice-ui";
import ConfirmDelete from "../../shared/ConfirmDelete";

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white";
const NOTES = ["DP", "Cicilan", "Pelunasan"];
const nowStr = () => dayjs().format("YYYY-MM-DDTHH:mm");

export default function PaymentsPanel({ invoice }: { invoice: Invoice }) {
  const remaining = invoice.total_price - invoice.amount_paid;
  const settled = remaining <= 0;
  const firstPayment = invoice.amount_paid === 0;

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toRemove, setToRemove] = useState<Payment | null>(null);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState({ amount: "", method: "transfer", paid_at: nowStr(), note: "" });

  const amount = Number(form.amount) || 0;
  const invalid = amount < 1 || amount > remaining;
  const isFull = amount === remaining && remaining > 0;

  // Pilihan cepat: pelunasan, separuh (DP 50% bila belum bayar, 50% sisa bila sudah ada pembayaran)
  const half = useMemo(() => Math.min(remaining, Math.round((firstPayment ? invoice.total_price : remaining) / 2)), [remaining, firstPayment, invoice.total_price]);
  const quick = [
    { key: "full", title: "Pelunasan", sub: formattedCurrency(remaining), value: remaining, note: "Pelunasan" },
    ...(half > 0 && half < remaining ? [{ key: "half", title: firstPayment ? "DP 50%" : "50% dari sisa", sub: formattedCurrency(half), value: half, note: firstPayment ? "DP" : "Cicilan" }] : []),
  ];
  const activeQuick = quick.find((q) => q.value === amount)?.key;

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const pick = (q: (typeof quick)[number]) => set({ amount: String(q.value), note: form.note && !NOTES.includes(form.note) ? form.note : q.note });

  const err = (e: unknown) => toast.error(isAxiosError(e) ? e.response?.data?.message ?? "Gagal menyimpan" : "Gagal menyimpan");

  const openForm = () => {
    setForm({ amount: String(remaining), method: "transfer", paid_at: nowStr(), note: firstPayment ? "Pelunasan" : "Pelunasan" });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid || busy) return;
    setBusy(true);
    try {
      await addPayment(invoice.id, {
        amount,
        method: form.method,
        paid_at: dayjs(form.paid_at).format("YYYY-MM-DD HH:mm:ss"),
        note: form.note.trim() || undefined,
      });
      toast.success(isFull ? "Pelunasan dicatat 🎉" : "Pembayaran dicatat");
      setOpen(false);
    } catch (e) {
      err(e);
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    setRemoving(true);
    try {
      await removePayment(invoice.id, toRemove.id);
      toast.success("Pembayaran dihapus");
      setToRemove(null);
    } catch (e) {
      err(e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section className={`${panel} print:hidden`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Pembayaran</h2>
          <StatusPill status={invoice.transaction_status} />
        </div>
        {!settled && !open && (
          <button onClick={openForm} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            <HiPlus /> Catat pembayaran
          </button>
        )}
      </div>

      <div className="mb-1.5 flex justify-between text-sm">
        <span>Terbayar <b>{formattedCurrency(invoice.amount_paid)}</b></span>
        <span className="text-gray-500">dari {formattedCurrency(invoice.total_price)}</span>
      </div>
      <PaymentProgress paid={invoice.amount_paid} total={invoice.total_price} status={invoice.transaction_status} />
      <p className={`mt-2 text-sm ${settled ? "text-emerald-600" : "text-red-600"}`}>
        {settled ? "Lunas ✓" : `Sisa tagihan ${formattedCurrency(remaining)}`}
      </p>

      {open && (
        <form onSubmit={submit} className="mt-5 space-y-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          {/* Nominal */}
          <div>
            <div className="mb-2 text-sm font-semibold">Berapa yang dibayar?</div>
            <div className={clsx("grid gap-2", quick.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
              {quick.map((q) => {
                const on = activeQuick === q.key;
                return (
                  <button key={q.key} type="button" onClick={() => pick(q)} aria-pressed={on}
                    className={clsx("relative cursor-pointer rounded-xl border-2 p-3 text-left transition",
                      on ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-gray-200 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-800")}>
                    {on && <HiCheck className="absolute right-2.5 top-2.5" />}
                    <div className={clsx("text-xs font-medium", on ? "text-white/80" : "text-gray-500")}>{q.title}</div>
                    <div className="text-base font-bold tabular-nums">{q.sub}</div>
                  </button>
                );
              })}
            </div>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rp</span>
              <input type="number" min={1} max={remaining} required inputMode="numeric" value={form.amount} onChange={(e) => set({ amount: e.target.value })}
                aria-label="Nominal pembayaran" placeholder="Nominal lain"
                className={clsx(field, "h-14 pl-11 text-xl font-bold tabular-nums", amount > remaining && "!border-red-500")} />
            </div>
            {amount > remaining && <p className="mt-1 text-xs font-medium text-red-600">Melebihi sisa tagihan ({formattedCurrency(remaining)}).</p>}
            {!invalid && (
              <p className="mt-1.5 text-xs text-gray-500">
                {isFull ? "Setelah ini invoice menjadi " : "Sisa setelah ini "}
                <b className={isFull ? "text-emerald-600" : "text-gray-900 dark:text-white"}>{isFull ? "LUNAS" : formattedCurrency(remaining - amount)}</b>
              </p>
            )}
          </div>

          {/* Metode */}
          <div>
            <div className="mb-2 text-sm font-semibold">Metode</div>
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Metode pembayaran">
              {Object.entries(METHOD_LABEL).map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.method === v} onClick={() => set({ method: v })}
                  className={clsx("h-10 cursor-pointer rounded-lg border text-sm font-medium transition",
                    form.method === v ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900" : "border-gray-300 bg-white hover:border-gray-500 dark:border-gray-600 dark:bg-gray-800")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal bayar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Tanggal &amp; jam bayar</span>
              <span className="flex gap-1.5">
                {[["Sekarang", nowStr()], ["Kemarin", dayjs().subtract(1, "day").format("YYYY-MM-DDTHH:mm")]].map(([l, v]) => (
                  <button key={l} type="button" onClick={() => set({ paid_at: v })}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800">
                    <HiOutlineClock /> {l}
                  </button>
                ))}
              </span>
            </div>
            <DateTimeInput value={form.paid_at} onChange={(v) => set({ paid_at: v })} className={clsx(field, "h-11")} placeholder="Pilih tanggal bayar" />
          </div>

          {/* Catatan */}
          <div>
            <div className="mb-2 text-sm font-semibold">Catatan <span className="font-normal text-gray-400">(opsional)</span></div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {NOTES.map((n) => (
                <button key={n} type="button" onClick={() => set({ note: form.note === n ? "" : n })} aria-pressed={form.note === n}
                  className={clsx("cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition",
                    form.note === n ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800")}>
                  {n}
                </button>
              ))}
            </div>
            <input maxLength={255} placeholder="Atau tulis catatan sendiri, mis. transfer BCA a.n. Budi" value={form.note} onChange={(e) => set({ note: e.target.value })} className={clsx(field, "h-11")} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-12 cursor-pointer rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800">Batal</button>
            <button type="submit" disabled={invalid || busy}
              className={clsx("h-12 flex-1 cursor-pointer rounded-xl text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40",
                isFull ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700")}>
              {busy ? "Menyimpan..." : isFull ? "Catat pelunasan" : amount > 0 && !invalid ? `Catat ${formattedCurrency(amount)}` : "Catat pembayaran"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-medium text-gray-500">Riwayat</h3>
        {!invoice.payments?.length ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-gray-500">Belum ada pembayaran.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            {invoice.payments.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{p.note || (i === 0 ? "Pembayaran pertama" : `Pembayaran ke-${i + 1}`)}</div>
                  <div className="text-xs text-gray-500">{dayjs(p.paid_at).format("D MMM YYYY, HH:mm")} • {METHOD_LABEL[p.method] ?? p.method}</div>
                </div>
                <div className="flex items-center gap-2">
                  <b className="text-sm">{formattedCurrency(p.amount)}</b>
                  <button onClick={() => setToRemove(p)} aria-label="Hapus pembayaran" title="Hapus"
                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><HiOutlineTrash size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDelete
        open={!!toRemove}
        busy={removing}
        title={toRemove ? `Hapus pembayaran ${formattedCurrency(toRemove.amount)}?` : ""}
        description="Status dan sisa tagihan invoice akan dihitung ulang. Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmRemove}
        onClose={() => !removing && setToRemove(null)}
      />
    </section>
  );
}
