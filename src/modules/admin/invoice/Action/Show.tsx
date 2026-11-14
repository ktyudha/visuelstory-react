import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { HiChevronLeft, HiPrinter } from "react-icons/hi";
import dayjs from "dayjs";
import "dayjs/locale/id";

import { formattedCurrency } from "@helpers/currency";
import useGet from "@services/admin/invoice/hooks/useGet";
import Logo from "@assets/logo/logo-mark.png";
import { METHOD_LABEL, StatusPill } from "../../shared/invoice-ui";
import { btnPrimary } from "../../shared/ui";
import PaymentsPanel from "./PaymentsPanel";
import CancelPanel from "./CancelPanel";

/** Ukuran & warna cetak: A4, margin rapi, warna latar ikut tercetak. */
const PRINT_STYLE = `
  @page { size: A4; margin: 14mm; }
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-break { break-inside: avoid; page-break-inside: avoid; }
`;

export default function Show() {
  const { invoiceId = "" } = useParams();
  const { data, loading, error } = useGet(invoiceId);

  const printRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: printRef,
    pageStyle: PRINT_STYLE,
    documentTitle: data ? `Invoice ${data.invoice_number}` : "Invoice",
  });

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat...</div>;
  if (error || !data) return <div className="p-10 text-center text-gray-500">Invoice tidak ditemukan.</div>;

  const packageTotal = data.invoice_details.reduce((s, d) => s + d.amount, 0);
  const addonTotal = data.invoice_details.reduce(
    (s, d) => s + (d.invoice_detail_addons ?? []).reduce((a, x) => a + x.amount, 0), 0);
  const remaining = data.total_price - data.amount_paid;
  const paid = data.transaction_status === "paid";

  return (
    <div className="space-y-4">
      {/* Bilah aksi (tidak ikut tercetak) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <HiChevronLeft /> Semua invoice
          </Link>
          <StatusPill status={data.transaction_status} />
        </div>
        <button onClick={() => print()} className={btnPrimary}>
          <HiPrinter size={16} /> Cetak / simpan PDF
        </button>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ===== Dokumen invoice: selalu terang agar cetakan konsisten ===== */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 sm:p-6">
          <div ref={printRef} className="relative mx-auto w-full max-w-[794px] bg-white p-6 text-[13px] leading-relaxed text-gray-900 shadow-sm sm:p-10 print:shadow-none">
            {paid && (
              <div aria-hidden className="pointer-events-none absolute right-10 top-28 rotate-[-12deg] rounded-md border-4 border-emerald-500/70 px-4 py-1 text-3xl font-extrabold tracking-widest text-emerald-500/70">
                LUNAS
              </div>
            )}

            {/* Kop */}
            <header className="flex items-start justify-between gap-6 border-b-2 border-gray-900 pb-5">
              <div className="flex items-center gap-3">
                <img src={Logo} alt="Visuelstory" className="h-14 w-14 object-contain" />
                <div>
                  <div className="font-serif text-xl font-semibold italic">Kisah Dalam Cerita</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Visuelstory</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tracking-wide">INVOICE</div>
                <div className="font-medium">{data.invoice_number}</div>
                <div className="text-gray-500">{dayjs(data.created_at).format("D MMMM YYYY")}</div>
              </div>
            </header>

            {/* Pihak */}
            <section className="no-break mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Dari</div>
                <div className="font-semibold">Visuelstory</div>
                <div className="text-gray-600">Sidoarjo, Jawa Timur 61275<br />+62 851 4492 0131</div>
              </div>
              <div className="sm:text-right">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Ditagihkan kepada</div>
                <div className="font-semibold capitalize">{data.customer?.name || "-"}</div>
                <div className="text-gray-600">
                  {data.customer?.whatsapp}
                  {data.customer?.address && <><br />{data.customer.address}</>}
                </div>
              </div>
            </section>

            {/* Rincian */}
            <section className="mt-7">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-y border-gray-300 bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <th className="px-3 py-2 font-semibold">Deskripsi</th>
                    <th className="w-14 px-3 py-2 text-center font-semibold">Qty</th>
                    <th className="w-36 px-3 py-2 text-right font-semibold">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoice_details.map((d, i) => (
                    <tr key={i} className="no-break border-b border-gray-200 align-top">
                      <td className="px-3 py-3">
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">{d.package?.category}</div>
                        <div className="font-semibold">{d.package?.name}</div>
                        {d.events?.map((e) => (
                          <div key={e.id} className="mt-1.5 text-xs text-gray-600">
                            <div>📅 {dayjs(e.date).format("dddd, D MMMM YYYY • HH:mm")} WIB</div>
                            <div>📍 {e.location}</div>
                            {e.note && e.note !== "-" && <div className="italic text-gray-500">“{e.note}”</div>}
                          </div>
                        ))}
                        {d.invoice_detail_addons?.map((a, ai) => (
                          <div key={ai} className="mt-1.5 flex justify-between gap-3 border-t border-dashed border-gray-200 pt-1.5 text-xs text-gray-600">
                            <span>+ {a.package_addon?.name ?? "Add-on"} × {a.quantity}</span>
                            <span>{formattedCurrency(a.amount)}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-3 py-3 text-center">{d.quantity}</td>
                      <td className="px-3 py-3 text-right font-medium">{formattedCurrency(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Ringkasan */}
            <section className="no-break mt-6 ml-auto max-w-[300px] space-y-1.5">
              <Line l="Paket" r={formattedCurrency(packageTotal)} />
              {addonTotal > 0 && <Line l="Add-on" r={formattedCurrency(addonTotal)} />}
              <Line l="Total" r={formattedCurrency(data.total_price)} strong />
              <Line l="Sudah dibayar" r={`− ${formattedCurrency(data.amount_paid)}`} />
              <div className={`mt-1 flex items-center justify-between rounded-md px-3 py-2.5 text-base font-bold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-gray-900 text-white"}`}>
                <span>{paid ? "Lunas" : "Sisa tagihan"}</span>
                <span>{formattedCurrency(Math.max(0, remaining))}</span>
              </div>
            </section>

            {/* Riwayat pembayaran */}
            {!!data.payments?.length && (
              <section className="no-break mt-8">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Riwayat pembayaran</div>
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {data.payments.map((p, i) => (
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

        {/* ===== Panel kerja admin (tidak ikut tercetak) ===== */}
        <div className="space-y-4 xl:sticky xl:top-20 print:hidden">
          <CancelPanel invoice={data} />
          <PaymentsPanel invoice={data} />
        </div>
      </div>
    </div>
  );
}

const Line = ({ l, r, strong }: { l: string; r: string; strong?: boolean }) => (
  <div className={`flex justify-between ${strong ? "border-t border-gray-300 pt-1.5 font-semibold" : "text-gray-600"}`}>
    <span>{l}</span><span>{r}</span>
  </div>
);
