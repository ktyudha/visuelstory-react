import { Link } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { HiOutlineCalendar, HiOutlineCash, HiOutlineClock } from "react-icons/hi";
import axiosInstance from "@lib/axios-instance";
import { formattedCurrency } from "@helpers/currency";
import { panel, StatusPill } from "../shared/invoice-ui";
import type { TransactionStatus } from "@services/admin/invoice/interfaces/get-all.type";

interface Stats {
  revenue_month: number;
  outstanding: number;
  unpaid_count: number;
  upcoming_count: number;
  cancel_pending: number;
  customers: number;
  upcoming: { id: string; date: string; location: string; customer: string | null; package: string | null; invoice_id: string | null; invoice_number: string | null }[];
  needs_attention: { id: string; invoice_number: string; customer: string | null; remaining: number; status: TransactionStatus }[];
}

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR<Stats>("/admin/dashboard", (u: string) =>
    axiosInstance({ withToken: true, tokenType: "admin" }).get(u).then((r) => r.data.data)
  );

  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat...</div>;
  if (error || !data) return <div className="p-10 text-center text-gray-500">Dashboard gagal dimuat.</div>;

  const cards = [
    { label: "Pemasukan bulan ini", value: formattedCurrency(data.revenue_month), icon: HiOutlineCash, to: "/admin/invoices" },
    { label: "Belum tertagih", value: formattedCurrency(data.outstanding), sub: `${data.unpaid_count} invoice`, icon: HiOutlineClock, to: "/admin/invoices" },
    ...(data.cancel_pending > 0 ? [{ label: "Pengajuan batal", value: String(data.cancel_pending), icon: HiOutlineClock, to: "/admin/invoices" }] : []),
    { label: "Acara 7 hari ke depan", value: String(data.upcoming_count), icon: HiOutlineCalendar, to: "/admin/events" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">{dayjs().format("dddd, D MMMM YYYY")}</p>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`${panel} transition hover:shadow-md`}>
            <c.icon className="mb-3 text-gray-400" size={22} />
            <div className="text-xl font-semibold sm:text-2xl">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
            {c.sub && <div className="text-xs text-gray-400">{c.sub}</div>}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="mb-3 font-semibold">Acara mendatang</h2>
          {data.upcoming.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Tidak ada acara terjadwal.</p> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.upcoming.map((e) => (
                <li key={e.id}>
                  <Link to={e.invoice_id ? `/admin/invoices/show/${e.invoice_id}` : "/admin/events"} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <div className="w-12 shrink-0 rounded-lg bg-gray-100 py-1 text-center dark:bg-gray-700">
                      <div className="text-lg font-semibold leading-tight">{dayjs(e.date).format("D")}</div>
                      <div className="text-xs uppercase text-gray-500">{dayjs(e.date).format("MMM")}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium capitalize">{e.customer || "-"} <span className="font-normal text-gray-500">• {e.package}</span></div>
                      <div className="truncate text-xs text-gray-500">{dayjs(e.date).format("HH:mm")} • {e.location}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={panel}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Perlu ditagih</h2>
            <Link to="/admin/invoices" className="text-sm text-blue-600 hover:underline">Lihat semua</Link>
          </div>
          {data.needs_attention.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Semua invoice sudah lunas 🎉</p> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.needs_attention.map((i) => (
                <li key={i.id}>
                  <Link to={`/admin/invoices/show/${i.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium capitalize">{i.customer || "-"}</div>
                      <div className="text-xs text-gray-500">{i.invoice_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">{formattedCurrency(i.remaining)}</div>
                      <StatusPill status={i.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
