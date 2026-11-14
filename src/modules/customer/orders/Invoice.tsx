import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Download } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import ConfirmSheet from "@components/ConfirmSheet";
import Logo from "@assets/logo/logo-mark.png";
import { formattedCurrency } from "@helpers/currency";
import { useOrder } from "@services/customer/api";
import { METHOD_LABEL } from "@modules/admin/shared/invoice-ui";
import { InvoiceSkeleton } from "../shared/skeletons";
import { btnPrimary, ErrorState, StatusBadge } from "../shared/ui";

/** Ukuran & warna cetak: A4, margin rapi, warna latar ikut tercetak. */
const PRINT_STYLE = `
  @page { size: A4; margin: 14mm; }
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-break { break-inside: avoid; page-break-inside: avoid; }
`;

export default function Invoice() {
  const { orderId } = useParams();
  const { order, error, loading, retry } = useOrder(orderId);
  const printRef = useRef<HTMLDivElement>(null);
  const [confirmDownload, setConfirmDownload] = useState(false);
  const print = useReactToPrint({
    contentRef: printRef,
    pageStyle: PRINT_STYLE,
    documentTitle: order ? `Invoice ${order.invoice_number}` : "Invoice",
  });

  if (loading) return <InvoiceSkeleton />;
  if (error || !order) return <ErrorState message="Invoice tidak ditemukan." onRetry={() => retry()} />;

  const packageTotal = order.invoice_details.reduce((s, d) => s + d.amount, 0);
  const addonTotal = order.invoice_details.reduce((s, d) => s + d.invoice_detail_addons.reduce((a, x) => a + x.amount, 0), 0);
  const paid = order.transaction_status === "paid";

  return (
    <>
      <Metadata title={`Invoice ${order.invoice_number}`} />
      <Link to={`/account/orders/${order.id}`} className="mb-4 hidden items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:inline-flex">
        <ArrowLeft className="size-4" /> Detail pesanan
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={order.transaction_status} />
        <button onClick={() => setConfirmDownload(true)} className={`${btnPrimary} max-sm:w-full`}><Download className="size-4" /> Unduh / simpan PDF</button>
      </div>

      {/* Dokumen invoice: selalu terang agar cetakan konsisten */}
      <div className="overflow-hidden rounded-2xl bg-neutral-200/60 p-2 dark:bg-neutral-800 sm:p-6">
        <div ref={printRef} className="relative mx-auto w-full max-w-[794px] bg-white p-5 text-[13px] leading-relaxed text-gray-900 shadow-sm sm:p-10 print:shadow-none">
          {paid && (
            <div aria-hidden className="pointer-events-none absolute right-6 top-28 rotate-[-12deg] rounded-md border-4 border-emerald-500/70 px-3 py-1 text-2xl font-extrabold tracking-widest text-emerald-500/70 sm:right-10 sm:text-3xl">LUNAS</div>
          )}

          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-gray-900 pb-5">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Visuelstory" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
              <div>
                <div className="font-serif text-lg font-semibold italic sm:text-xl">Kisah Dalam Cerita</div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Visuelstory</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold tracking-wide sm:text-2xl">INVOICE</div>
              <div className="font-medium">{order.invoice_number}</div>
              <div className="text-gray-500">{dayjs(order.created_at).format("D MMMM YYYY")}</div>
            </div>
          </header>

          <section className="no-break mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Dari</div>
              <div className="font-semibold">Visuelstory</div>
              <div className="text-gray-600">Sidoarjo, Jawa Timur 61275<br />+62 851 4492 0131</div>
            </div>
            <div className="sm:text-right">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Ditagihkan kepada</div>
              <div className="font-semibold capitalize">{order.customer?.name || "-"}</div>
              <div className="text-gray-600">
                {order.customer?.whatsapp}
                {order.customer?.address && <><br />{order.customer.address}</>}
              </div>
            </div>
          </section>

          <section className="mt-7">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y border-gray-300 bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                  <th className="px-2 py-2 font-semibold sm:px-3">Deskripsi</th>
                  <th className="w-10 px-2 py-2 text-center font-semibold sm:w-14 sm:px-3">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold sm:w-36 sm:px-3">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {order.invoice_details.map((d, i) => (
                  <tr key={i} className="no-break border-b border-gray-200 align-top">
                    <td className="px-2 py-3 sm:px-3">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">{d.package?.category}</div>
                      <div className="font-semibold">{d.package?.name}</div>
                      {d.events?.map((e) => (
                        <div key={e.id} className="mt-1.5 text-xs text-gray-600">
                          <div>📅 {dayjs(e.date).format("dddd, D MMMM YYYY • HH:mm")} WIB</div>
                          <div>📍 {e.location}</div>
                          {e.note && e.note !== "-" && <div className="italic text-gray-500">“{e.note}”</div>}
                        </div>
                      ))}
                      {d.invoice_detail_addons.map((a, ai) => (
                        <div key={ai} className="mt-1.5 flex justify-between gap-3 border-t border-dashed border-gray-200 pt-1.5 text-xs text-gray-600">
                          <span>+ {a.package_addon?.name ?? "Add-on"} × {a.quantity}</span>
                          <span>{formattedCurrency(a.amount)}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-2 py-3 text-center sm:px-3">{d.quantity}</td>
                    <td className="px-2 py-3 text-right font-medium sm:px-3">{formattedCurrency(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="no-break ml-auto mt-6 max-w-[300px] space-y-1.5">
            <Line l="Paket" r={formattedCurrency(packageTotal)} />
            {addonTotal > 0 && <Line l="Add-on" r={formattedCurrency(addonTotal)} />}
            <Line l="Total" r={formattedCurrency(order.total_price)} strong />
            <Line l="Sudah dibayar" r={`− ${formattedCurrency(order.amount_paid)}`} />
            <div className={`mt-1 flex items-center justify-between rounded-md px-3 py-2.5 text-base font-bold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-gray-900 text-white"}`}>
              <span>{paid ? "Lunas" : "Sisa tagihan"}</span>
              <span>{formattedCurrency(Math.max(0, order.remaining_paid))}</span>
            </div>
          </section>

          {!!order.payments?.length && (
            <section className="no-break mt-8">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Riwayat pembayaran</div>
              <table className="w-full border-collapse text-xs">
                <tbody>
                  {order.payments.map((p, i) => (
                    <tr key={p.id} className="border-b border-gray-200">
                      <td className="py-1.5 pr-3 text-gray-500">{dayjs(p.paid_at).format("D MMM YYYY")}</td>
                      <td className="py-1.5 pr-3">{p.note || (i === 0 ? "Pembayaran pertama" : `Pembayaran ke-${i + 1}`)}</td>
                      <td className="py-1.5 pr-3 text-gray-500">{METHOD_LABEL[p.method] ?? p.method}</td>
                      <td className="py-1.5 text-right font-medium">{formattedCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <footer className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
            Terima kasih telah mempercayakan momen Anda kepada Visuelstory.
          </footer>
        </div>
      </div>

      {confirmDownload && (
        <ConfirmSheet
          title="Unduh invoice?"
          message={`Invoice ${order.invoice_number} akan dibuka di jendela cetak. Pilih "Simpan sebagai PDF" untuk menyimpannya.`}
          confirmLabel="Ya, unduh"
          cancelLabel="Batal"
          onConfirm={() => { setConfirmDownload(false); setTimeout(() => print(), 250); }}
          onClose={() => setConfirmDownload(false)}
        />
      )}
    </>
  );
}

const Line = ({ l, r, strong }: { l: string; r: string; strong?: boolean }) => (
  <div className={`flex justify-between ${strong ? "border-t border-gray-300 pt-1.5 font-semibold" : "text-gray-600"}`}>
    <span>{l}</span><span>{r}</span>
  </div>
);
