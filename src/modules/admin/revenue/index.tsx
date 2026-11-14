import { useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import axiosInstance from "@lib/axios-instance";
import { formattedCurrency } from "@helpers/currency";
import { LoadingRows } from "../shared/TableState";
import { METHOD_LABEL, panel } from "../shared/invoice-ui";

interface Revenue {
  year: number;
  years: number[];
  totals: { revenue: number; booked: number; invoices: number; average: number; outstanding: number };
  months: { month: number; revenue: number; payments: number; invoices: number; booked: number }[];
  by_method: { method: string; count: number; amount: number }[];
  top_packages: { name: string; qty: number; amount: number }[];
  payments: { id: string; invoice_id: string; invoice_number: string | null; customer: string | null; amount: number; method: string; note: string | null; paid_at: string }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** 12.500.000 -> "12,5 jt" untuk label grafik. */
const compact = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(".", ",")} M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",").replace(",0", "")} jt`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return String(n);
};

export default function AdminRevenue() {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState<number | null>(null);

  const { data, error, isLoading } = useSWR<Revenue>(
    `/admin/revenue?year=${year}${month ? `&month=${month}` : ""}`,
    (u: string) => axiosInstance({ withToken: true, tokenType: "admin" }).get(u).then((r) => r.data.data),
    { keepPreviousData: true }
  );

  if (error) return <div className="p-10 text-center text-gray-500">Rekap omzet gagal dimuat.</div>;

  const max = Math.max(1, ...(data?.months.map((m) => m.revenue) ?? [0]));
  const thisMonth = data?.months[dayjs().month()];
  const lastMonth = data?.months[dayjs().month() - 1];
  const delta = year === dayjs().year() && thisMonth && lastMonth && lastMonth.revenue > 0
    ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100) : null;
  const methodTotal = data?.by_method.reduce((s, m) => s + m.amount, 0) || 1;
  const topMax = Math.max(1, ...(data?.top_packages.map((p) => p.amount) ?? [0]));

  const cards = [
    { label: `Omzet ${year}`, value: data ? formattedCurrency(data.totals.revenue) : "-", sub: "Pembayaran diterima" },
    { label: "Nilai booking", value: data ? formattedCurrency(data.totals.booked) : "-", sub: `${data?.totals.invoices ?? 0} invoice dibuat` },
    { label: "Belum tertagih", value: data ? formattedCurrency(data.totals.outstanding) : "-", sub: "Semua invoice aktif" },
    { label: "Rata-rata invoice", value: data ? formattedCurrency(data.totals.average) : "-", sub: "Nilai booking / invoice" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Omzet dihitung dari pembayaran yang diterima per tanggal bayar. Pesanan yang dibatalkan tidak dihitung.</p>
        <select value={year} onChange={(e) => { setYear(+e.target.value); setMonth(null); }} aria-label="Tahun"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
          {(data?.years ?? [year]).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c, i) => (
          <div key={c.label} className={panel}>
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className={clsx("mt-1 text-xl font-semibold sm:text-2xl", isLoading && !data && "animate-pulse text-gray-300")}>{c.value}</div>
            <div className="mt-0.5 text-xs text-gray-400">
              {c.sub}
              {i === 0 && delta !== null && <span className={clsx("ml-1.5 font-medium", delta >= 0 ? "text-emerald-600" : "text-red-600")}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs bulan lalu</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Grafik omzet per bulan */}
      <section className={panel}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Omzet per bulan</h2>
          {month && <button onClick={() => setMonth(null)} className="cursor-pointer text-sm text-blue-600 hover:underline">Tampilkan setahun</button>}
        </div>
        <div className="flex h-52 items-end gap-1.5 sm:gap-3" role="img" aria-label={`Grafik omzet per bulan tahun ${year}`}>
          {MONTHS.map((label, i) => {
            const m = data?.months[i];
            const h = m ? Math.max(m.revenue > 0 ? 4 : 0, Math.round((m.revenue / max) * 100)) : 0;
            const active = month === i + 1;
            return (
              <button key={label} type="button" onClick={() => setMonth(active ? null : i + 1)} disabled={!m?.revenue}
                title={m ? `${MONTHS_FULL[i]}: ${formattedCurrency(m.revenue)} (${m.payments} pembayaran)` : label}
                className="group flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1 disabled:cursor-default">
                <span className="text-[10px] font-medium text-gray-500 sm:text-xs">{m && m.revenue > 0 ? compact(m.revenue) : ""}</span>
                <span className={clsx("w-full rounded-t-md transition-all", active ? "bg-blue-600" : m?.revenue ? "bg-blue-200 group-hover:bg-blue-400 dark:bg-blue-900 dark:group-hover:bg-blue-600" : "bg-gray-100 dark:bg-gray-700")} style={{ height: `${m?.revenue ? h : 2}%` }} />
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-1.5 sm:gap-3">
          {MONTHS.map((label, i) => <span key={label} className={clsx("min-w-0 flex-1 text-center text-[10px] sm:text-xs", month === i + 1 ? "font-semibold text-blue-600" : "text-gray-500")}>{label}</span>)}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="mb-3 font-semibold">Paket terlaris</h2>
          {!data ? <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />)}</div>
            : data.top_packages.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Belum ada data.</p> : (
            <ul className="space-y-3">
              {data.top_packages.map((p) => (
                <li key={p.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{p.name} <span className="font-normal text-gray-400">× {p.qty}</span></span>
                    <span className="shrink-0 font-semibold">{formattedCurrency(p.amount)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(p.amount / topMax) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={panel}>
          <h2 className="mb-3 font-semibold">Metode pembayaran</h2>
          {!data ? <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />)}</div>
            : data.by_method.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Belum ada pembayaran.</p> : (
            <ul className="space-y-3">
              {data.by_method.map((m) => (
                <li key={m.method}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{METHOD_LABEL[m.method] ?? m.method} <span className="font-normal text-gray-400">{m.count}×</span></span>
                    <span className="font-semibold">{formattedCurrency(m.amount)} <span className="font-normal text-gray-400">({Math.round((m.amount / methodTotal) * 100)}%)</span></span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(m.amount / methodTotal) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Daftar pembayaran */}
      <section className={panel}>
        <h2 className="mb-3 font-semibold">Pembayaran {month ? `${MONTHS_FULL[month - 1]} ${year}` : `terbaru ${year}`}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="py-2 pr-4 font-medium">Tanggal</th><th className="py-2 pr-4 font-medium">Invoice</th><th className="py-2 pr-4 font-medium">Customer</th><th className="py-2 pr-4 font-medium">Metode</th><th className="py-2 text-right font-medium">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {!data ? <LoadingRows cols={5} rows={4} /> : data.payments.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500">Belum ada pembayaran.</td></tr>
              ) : data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-gray-500">{dayjs(p.paid_at).format("D MMM YYYY")}</td>
                  <td className="py-2.5 pr-4"><Link to={`/admin/invoices/show/${p.invoice_id}`} className="font-medium text-blue-600 hover:underline">{p.invoice_number}</Link>{p.note && <span className="ml-1.5 text-xs text-gray-400">{p.note}</span>}</td>
                  <td className="py-2.5 pr-4 capitalize">{p.customer || "-"}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{METHOD_LABEL[p.method] ?? p.method}</td>
                  <td className="py-2.5 text-right font-semibold">{formattedCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
