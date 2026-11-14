import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileText, MapPin, MessageCircle } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import { formattedCurrency } from "@helpers/currency";
import BottomSheet from "@components/BottomSheet";
import { getApiError, requestCancel, useOrder } from "@services/customer/api";
import { OrderDetailSkeleton } from "../shared/skeletons";
import { ADMIN_WHATSAPP, btnDangerSoft, btnDangerSolid, btnGhost, btnPrimary, CancelBadge, Card, ErrorState, inputCls, StatusBadge } from "../shared/ui";

export default function OrderDetail() {
  const { orderId } = useParams();
  const { order, error, loading, retry } = useOrder(orderId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) return <OrderDetailSkeleton />;
  if (error || !order) return <ErrorState message="Pesanan tidak ditemukan." onRetry={() => retry()} />;

  const cancel = order.cancel;
  const submitCancel = async () => {
    setSending(true);
    try {
      await requestCancel(order.id, reason.trim());
      await retry();
      setCancelOpen(false);
      setReason("");
      toast.success("Pengajuan pembatalan terkirim. Menunggu persetujuan admin.");
    } catch (e) {
      toast.error(getApiError(e));
    } finally {
      setSending(false);
    }
  };

  const wa = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Halo Visuelstory, saya ingin menanyakan pesanan ${order.invoice_number}.`)}`;

  return (
    <>
      <Metadata title={order.invoice_number} />
      <Link to="/account" className="hidden md:inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4">
        <ArrowLeft className="size-4" /> Pesanan saya
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.invoice_number}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Dipesan {dayjs(order.created_at).format("D MMMM YYYY")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={order.transaction_status} />
          <CancelBadge status={cancel?.status} />
        </div>
      </div>

      {/* Status pengajuan pembatalan */}
      {cancel?.status && (
        <section className={`mb-6 rounded-2xl border p-4 text-sm ${cancel.status === "requested" ? "border-amber-300/60 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30" : cancel.status === "approved" ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900" : "border-red-300/60 bg-red-50 dark:border-red-500/30 dark:bg-red-950/30"}`}>
          <div className="font-semibold">
            {cancel.status === "requested" && "Pengajuan pembatalan menunggu persetujuan admin"}
            {cancel.status === "approved" && "Pesanan ini sudah dibatalkan"}
            {cancel.status === "rejected" && "Pengajuan pembatalan ditolak"}
          </div>
          {cancel.reason && <p className="mt-1 text-neutral-600 dark:text-neutral-300">Alasan Anda: “{cancel.reason}”</p>}
          {cancel.admin_note && <p className="mt-1 text-neutral-600 dark:text-neutral-300">Catatan admin: “{cancel.admin_note}”</p>}
          {cancel.status === "approved" && <p className="mt-1 text-neutral-500 dark:text-neutral-400">Jadwal Anda sudah dibuka kembali. Hubungi admin untuk urusan pengembalian dana.</p>}
        </section>
      )}

      <div className="space-y-4">
        {order.invoice_details.map((d, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex justify-between gap-3">
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{d.package?.category}</div>
                <div className="font-semibold">{d.package?.name} × {d.quantity}</div>
              </div>
              <b>{formattedCurrency(d.amount)}</b>
            </div>
            {d.invoice_detail_addons.map((a, ai) => (
              <div key={ai} className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300 mt-2 pl-3">
                <span>+ {a.package_addon?.name ?? "Add-on"} × {a.quantity}</span>
                <span>{formattedCurrency(a.amount)}</span>
              </div>
            ))}
            {d.events?.map((e) => (
              <div key={e.id} className="mt-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 p-3 text-sm space-y-1.5">
                <div className="flex items-center gap-2"><CalendarDays className="size-4" />{dayjs(e.date).format("dddd, D MMMM YYYY • HH:mm")}</div>
                <div className="flex items-center gap-2"><MapPin className="size-4 shrink-0" />{e.location}</div>
                {e.note && e.note !== "-" && <div className="text-neutral-500 dark:text-neutral-400 pl-6">{e.note}</div>}
              </div>
            ))}
          </Card>
        ))}
      </div>

      {cancelOpen && (
        <BottomSheet label="Ajukan pembatalan" onClose={() => (sending ? undefined : setCancelOpen(false))}>
          <h2 className="text-lg font-bold">Ajukan pembatalan</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Pesanan baru dibatalkan setelah disetujui admin. Pembayaran yang sudah masuk diurus langsung oleh admin.</p>
          <label className="mt-4 block text-sm font-medium">Alasan pembatalan</label>
          <textarea rows={4} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mis. acara ditunda / jadwal bentrok" className={`${inputCls} mt-1.5`} />
          <div className="mt-4 grid gap-2.5">
            <button onClick={submitCancel} disabled={sending || reason.trim().length < 5} className={btnDangerSolid}>{sending ? "Mengirim..." : "Kirim pengajuan"}</button>
            <button onClick={() => setCancelOpen(false)} disabled={sending} className={`${btnGhost}`}>Kembali</button>
          </div>
        </BottomSheet>
      )}

      <Card className="p-5 mt-6 max-w-sm ml-auto text-sm space-y-2">
        <Row l="Total" r={formattedCurrency(order.total_price)} />
        <Row l="Sudah dibayar" r={formattedCurrency(order.amount_paid)} />
        <div className="border-t pt-2"><Row l="Sisa pembayaran" r={formattedCurrency(order.remaining_paid)} bold /></div>
        {!!order.payments?.length && (
          <div className="border-t pt-3 space-y-1.5">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Riwayat pembayaran</div>
            {order.payments.map((p) => (
              <div key={p.id} className="flex justify-between gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">{dayjs(p.paid_at).format("D MMM YYYY")}{p.note ? ` • ${p.note}` : ""}</span>
                <span className="font-medium">{formattedCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Aksi: utama (bayar) > sekunder (invoice) > berisiko (batal) */}
      <div className="mt-4 ml-auto grid max-w-sm gap-3">
        {order.remaining_paid > 0 && order.cancel?.status !== "approved" && (
          <a href={wa} target="_blank" rel="noreferrer" className={`${btnPrimary} w-full`}><MessageCircle className="size-4" /> Konfirmasi pembayaran</a>
        )}
        <Link to={`/account/orders/${order.id}/invoice`} className={`${btnGhost} w-full`}><FileText className="size-4" /> Lihat &amp; unduh invoice</Link>
        {cancel?.can_request && (
          <button onClick={() => setCancelOpen(true)} className={`${btnDangerSoft} w-full`}>
            Ajukan pembatalan
          </button>
        )}
      </div>
    </>
  );
}

const Row = ({ l, r, bold }: { l: string; r: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? "font-bold text-base" : ""}`}>
    <span className={bold ? "" : "text-neutral-500 dark:text-neutral-400"}>{l}</span><span>{r}</span>
  </div>
);
