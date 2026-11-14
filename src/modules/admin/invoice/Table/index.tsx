import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiSearch, HiOutlineTrash } from "react-icons/hi";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import "dayjs/locale/id";

import PaginationComponent from "@components/Flowbite/Pagination";
import { formattedCurrency } from "@helpers/currency";
import useGetAll from "@services/admin/invoice/hooks/useGetAll";
import type { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { PaymentProgress, StatusPill } from "../../shared/invoice-ui";
import Delete from "../Action/Delete";
import { DeliveryChips } from "../../shared/delivery-ui";

const TABS = [
  { value: "", label: "Semua" },
  { value: "unpaid", label: "Belum dibayar" },
  { value: "down_payment", label: "DP / Cicilan" },
  { value: "paid", label: "Lunas" },
];

export default function TableInvoice() {
  const { data, pagination, setPageNum, loading, setName, status, setStatus } = useGetAll();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearch = useCallback(debounce((v: string) => { setName(v); setPageNum(1); }, 400), []);

  return (
    <div className="space-y-4">
      {toDelete && (
        <Delete id={toDelete.id} invoice_number={toDelete.invoice_number} onOpen onClose={() => setToDelete(null)} />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Kelola tagihan dan pantau pembayaran DP sampai pelunasan.</p>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Cari nama customer..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <Link to="create" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <HiPlus /> Buat invoice
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm ${
              status === t.value
                ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Acara</th>
              <th className="px-4 py-3 font-medium min-w-48">Pembayaran</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium min-w-44">Pengiriman hasil</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading && (
              <tr><td colSpan={7} className="py-16 text-center text-gray-500">Memuat...</td></tr>
            )}
            {!loading && (!data || data.length === 0) && (
              <tr><td colSpan={7} className="py-16 text-center text-gray-500">Tidak ada invoice.</td></tr>
            )}
            {data?.map((inv) => {
              const events = inv.invoice_details.flatMap((d) => d.events ?? []);
              const next = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
              const pkgs = inv.invoice_details.map((d) => d.package?.name).filter(Boolean).join(", ");
              return (
                <tr key={inv.id} onClick={() => navigate(`show/${inv.id}`)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{inv.invoice_number}</div>
                    <div className="text-xs text-gray-500">{dayjs(inv.created_at).format("D MMM YYYY")}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium capitalize text-gray-900 dark:text-white">{inv.customer?.name || "-"}</div>
                    <div className="text-xs text-gray-500">{inv.customer?.whatsapp}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-56 truncate text-gray-900 dark:text-white">{pkgs || "-"}</div>
                    <div className="text-xs text-gray-500">{next ? dayjs(next.date).format("ddd, D MMM YYYY • HH:mm") : "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mb-1.5 flex justify-between gap-3 text-xs">
                      <span className="text-gray-500">Dibayar {formattedCurrency(inv.amount_paid)}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formattedCurrency(inv.total_price)}</span>
                    </div>
                    <PaymentProgress paid={inv.amount_paid} total={inv.total_price} status={inv.transaction_status} />
                    {inv.remaining_paid > 0 && (
                      <div className="mt-1 text-xs text-red-600">Sisa {formattedCurrency(inv.remaining_paid)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusPill status={inv.transaction_status} /></td>
                  <td className="px-4 py-3"><DeliveryChips delivery={inv.delivery} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setToDelete(inv); }}
                      className="cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus invoice" title="Hapus"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationComponent
        setPageNum={setPageNum}
        maxPageNum={pagination?.last_page || 1}
        perPage={pagination?.per_page ?? 10}
        total={pagination?.total ?? 10}
      />
    </div>
  );
}
