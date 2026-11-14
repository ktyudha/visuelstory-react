import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Clapperboard, Images, MapPin, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import { timeLeft } from "@helpers/deadline";
import { formattedCurrency } from "@helpers/currency";
import { useOrder } from "@services/customer/api";
import { ADMIN_WHATSAPP, btnPrimary, Card, ErrorState, Spinner, StatusBadge } from "../shared/ui";

export default function OrderDetail() {
  const { orderId } = useParams();
  const { order, error, loading, retry } = useOrder(orderId);

  if (loading) return <Spinner />;
  if (error || !order) return <ErrorState message="Pesanan tidak ditemukan." onRetry={() => retry()} />;

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
        <StatusBadge status={order.transaction_status} />
      </div>

      {order.gallery_ready && (
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-amber-400/25 bg-neutral-950 p-5 text-white shadow-sm">
          {/* kilau emas halus, senada logo */}
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-600 text-neutral-950">
                <Images className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-base font-semibold text-transparent">
                  {order.selection_submitted_at ? "Pilihan foto Anda sudah kami terima" : "Foto hasil sesi Anda sudah siap"}
                </div>
                <p className="mt-0.5 text-sm text-white/70">
                  {order.selection_submitted_at
                    ? "Tim kami akan memproses foto pilihan Anda. Foto tetap bisa dilihat dan diunduh kapan saja."
                    : "Pilih foto favorit untuk diedit, lalu unduh hasilnya."}
                </p>
              </div>
            </div>
            <Link
              to={`/account/orders/${order.id}/gallery`}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-200 to-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
            >
              {order.selection_submitted_at ? "Lihat galeri" : "Pilih foto"}
            </Link>
          </div>
        </section>
      )}

      {/* Tahapan hasil foto */}
      {order.delivery && (() => {
        const d = order.delivery;
        const steps = [
          { label: "Foto siap", done: d.jpeg.uploaded, hint: d.jpeg.uploaded ? "Sudah tersedia" : "Menyusul setelah acara" },
          {
            label: "Pilih foto", done: !!d.selection.submitted_at || !!d.selection.closed,
            hint: d.selection.submitted_at ? "Sudah dikirim"
              : d.selection.closed ? "Tenggat berakhir"
              : d.jpeg.uploaded ? `Giliran Anda${timeLeft(d.selection.deadline_at) ? ` • ${timeLeft(d.selection.deadline_at)!.label.toLowerCase()}` : ""}` : "Setelah foto siap",
            turn: d.jpeg.uploaded && !d.selection.submitted_at && !d.selection.closed,
          },
          {
            label: "Hasil editan", done: d.edited.delivered,
            hint: d.edited.delivered ? "Sudah dikirim" : (d.selection.ready_to_edit ?? !!d.selection.submitted_at) ? "Sedang kami proses" : "Setelah pilihan dikirim / tenggat berakhir",
          },
          ...(d.video.applicable ? [{ label: "Video", done: d.video.delivered, hint: d.video.delivered ? "Sudah dikirim" : "Sedang kami siapkan" }] : []),
        ];
        return (
          <Card className="mb-6 p-4">
            <h2 className="mb-3 text-sm font-semibold">Status hasil foto</h2>
            <ol className={`grid gap-3 ${steps.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
              {steps.map((s, i) => (
                <li key={s.label} className="flex flex-col items-start gap-1.5">
                  <span className={`grid size-8 place-items-center rounded-full text-sm font-bold ${s.done ? "bg-emerald-500 text-white" : s.turn ? "bg-amber-400 text-neutral-900 ring-4 ring-amber-400/25" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                    {s.done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <div className="text-sm font-medium leading-tight">{s.label}</div>
                  <div className={`text-xs ${s.turn ? "font-semibold text-amber-700 dark:text-amber-300" : "text-neutral-500 dark:text-neutral-400"}`}>{s.hint}</div>
                </li>
              ))}
            </ol>
          </Card>
        );
      })()}

      {order.edited_ready && (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white"><Sparkles className="size-5" /></span>
            <div>
              <div className="font-semibold text-emerald-800 dark:text-emerald-300">Hasil editan sudah siap</div>
              <p className="text-sm text-emerald-900/70 dark:text-emerald-200/70">Lihat dan unduh foto yang sudah kami edit.</p>
            </div>
          </div>
          <Link to={`/account/orders/${order.id}/edited`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto">Lihat hasil editan</Link>
        </section>
      )}

      {order.video_url && /^https?:\/\//i.test(order.video_url) && (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-purple-400/30 bg-purple-50 p-5 dark:bg-purple-950/30">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-600 text-white"><Clapperboard className="size-5" /></span>
            <div>
              <div className="font-semibold text-purple-800 dark:text-purple-300">Video Anda sudah siap</div>
              <p className="text-sm text-purple-900/70 dark:text-purple-200/70">Buka untuk menonton atau mengunduh.</p>
            </div>
          </div>
          <a href={order.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 sm:w-auto">Buka video</a>
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
        {order.remaining_paid > 0 && (
          <a href={wa} target="_blank" rel="noreferrer" className={`${btnPrimary} w-full mt-3`}>Tanya / konfirmasi pembayaran</a>
        )}
      </Card>
    </>
  );
}

const Row = ({ l, r, bold }: { l: string; r: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? "font-bold text-base" : ""}`}>
    <span className={bold ? "" : "text-neutral-500 dark:text-neutral-400"}>{l}</span><span>{r}</span>
  </div>
);
