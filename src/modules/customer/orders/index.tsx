import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import { formattedCurrency } from "@helpers/currency";
import { useOrders } from "@services/customer/api";
import { isStandalone } from "../../../theme/useInstallPrompt";
import Shortcuts from "./Shortcuts";
import OrderActions from "./OrderActions";
import { btnPrimary, Card, ErrorState, Spinner, StatusBadge } from "../shared/ui";

export default function Orders() {
  const { orders, error, loading, retry } = useOrders();

  return (
    <>
      <Metadata title="Pesanan Saya" />
      <div className="mb-5 flex items-center justify-end md:mb-6 md:justify-between">
        <h1 className="hidden text-2xl font-bold md:block">Pesanan Saya</h1>
        <Link to="/booking" className={btnPrimary}>+ Booking baru</Link>
      </div>

      {orders && isStandalone() && <Shortcuts orders={orders} />}

      {loading && <Spinner />}
      {error && <ErrorState message="Pesanan gagal dimuat." onRetry={() => retry()} />}

      {orders && orders.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Anda belum memiliki pesanan.</p>
          <Link to="/booking" className={btnPrimary}>Booking sekarang</Link>
        </Card>
      )}

      <div className="space-y-4">
        {orders?.map((o) => {
          const event = o.invoice_details[0]?.events?.[0];
          return (
            <Card key={o.id} className="overflow-hidden">
              {/* Bagian atas kartu: ketuk untuk membuka detail pesanan */}
              <Link to={`/account/orders/${o.id}`} className="block p-5 transition hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800" aria-label={`Buka detail pesanan ${o.invoice_number}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{o.invoice_number}</div>
                    <div className="font-semibold">{o.invoice_details.map((d) => d.package?.name).filter(Boolean).join(", ") || "Pesanan"}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={o.transaction_status} />
                    <ChevronRight className="size-5 text-neutral-400" aria-hidden />
                  </div>
                </div>
                {event && (
                  <div className="mt-3 grid gap-1.5 text-sm text-neutral-600 dark:text-neutral-300 sm:grid-cols-2">
                    <span className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0" />{dayjs(event.date).format("dddd, D MMMM YYYY • HH:mm")}</span>
                    <span className="flex items-center gap-2"><MapPin className="size-4 shrink-0" /><span className="truncate">{event.location}</span></span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Total <b className="text-neutral-900 dark:text-neutral-100">{formattedCurrency(o.total_price)}</b></span>
                  {o.remaining_paid > 0 && <span className="font-medium text-red-600 dark:text-red-400">Sisa {formattedCurrency(o.remaining_paid)}</span>}
                </div>
              </Link>
              <div className="px-5 pb-5 empty:hidden"><OrderActions order={o} /></div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
