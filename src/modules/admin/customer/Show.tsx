import { Link, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { HiChevronLeft, HiOutlinePencil, HiPlus } from "react-icons/hi";
import axiosInstance from "@lib/axios-instance";
import { formattedCurrency } from "@helpers/currency";
import useGet from "@services/admin/customer/hooks/useGet";
import type { Invoice } from "@services/admin/invoice/interfaces/get-all.type";
import { panel, PaymentProgress, StatusPill } from "../shared/invoice-ui";
import { btnGhost, btnPrimary } from "../shared/ui";
import CustomerFormModal from "./Action/FormModal";
import { useModalParams } from "../shared/useModalParams";

export default function CustomerShow() {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const { openEdit } = useModalParams();
  const { data: customer, loading } = useGet(customerId);

  const { data: invoices } = useSWR<Invoice[]>(`/admin/invoices?customer_id=${customerId}&page_limit=100`, (u: string) =>
    axiosInstance({ withToken: true, tokenType: "admin" }).get(u).then((r) => r.data.data)
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat...</div>;
  if (!customer) return <div className="p-10 text-center text-gray-500">Customer tidak ditemukan.</div>;

  const total = invoices?.reduce((s, i) => s + i.total_price, 0) ?? 0;
  const paid = invoices?.reduce((s, i) => s + i.amount_paid, 0) ?? 0;

  return (
    <div className="space-y-5">
      <CustomerFormModal />
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
        <HiChevronLeft /> Semua customer
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_1fr]">
        <section className={`${panel} space-y-4`}>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-gray-900 text-lg font-semibold uppercase text-white dark:bg-white dark:text-gray-900">
              {(customer.name || "?").charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold capitalize">{customer.name || "(tanpa nama)"}</div>
              <div className="text-sm text-gray-500">{customer.whatsapp}</div>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt><dd>{customer.email || "-"}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-gray-500">Alamat</dt><dd>{customer.address || "-"}</dd></div>
          </dl>
          <div className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div><div className="text-xs text-gray-500">Total transaksi</div><b>{formattedCurrency(total)}</b></div>
            <div><div className="text-xs text-gray-500">Belum dibayar</div><b className="text-red-600">{formattedCurrency(total - paid)}</b></div>
          </div>
          <div className="flex gap-2">
            <button className={`${btnGhost} flex-1`} onClick={() => openEdit(customerId)}><HiOutlinePencil /> Ubah</button>
            <a className={`${btnGhost} flex-1`} target="_blank" rel="noreferrer" href={`https://wa.me/${customer.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
          </div>
        </section>

        <section className={panel}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Riwayat invoice {invoices && <span className="font-normal text-gray-500">({invoices.length})</span>}</h2>
            <button className={btnPrimary} onClick={() => navigate("/admin/invoices/create")}><HiPlus /> Invoice baru</button>
          </div>
          {!invoices && <p className="py-8 text-center text-sm text-gray-500">Memuat...</p>}
          {invoices?.length === 0 && <p className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">Belum ada invoice.</p>}
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {invoices?.map((i) => (
              <li key={i.id}>
                <Link to={`/admin/invoices/show/${i.id}`} className="block py-3 hover:opacity-80">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{i.invoice_number}</div>
                      <div className="text-xs text-gray-500">{dayjs(i.created_at).format("D MMM YYYY")} • {i.invoice_details.map((d) => d.package?.name).filter(Boolean).join(", ")}</div>
                    </div>
                    <StatusPill status={i.transaction_status} />
                  </div>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-gray-500">Dibayar {formattedCurrency(i.amount_paid)}</span><b>{formattedCurrency(i.total_price)}</b></div>
                  <PaymentProgress paid={i.amount_paid} total={i.total_price} status={i.transaction_status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
