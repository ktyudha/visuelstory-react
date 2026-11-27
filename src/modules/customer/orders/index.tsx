import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, FileText, MapPin } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import { formattedCurrency } from "@helpers/currency";
import { useOrders } from "@services/customer/api";
import useGlobalStore from "@store/useStore";
import { OrdersSkeleton, Skeleton } from "../shared/skeletons";
import { btnPrimary, CancelBadge, Card, ErrorState, StatusBadge } from "../shared/ui";

export default function Orders() {
  const { orders, error, loading, retry } = useOrders();
  const me = useGlobalStore((s) => s.me);

  return (
    <>
      <Metadata title="Pesanan Saya" />
      <div className="mb-5 flex items-center justify-end max-md:hidden md:mb-6 md:justify-between">
        <h1 className="hidden text-2xl font-bold md:block">Pesanan Saya</h1>
        <Link to="/booking" className={btnPrimary}>+ Booking baru</Link>
      </div>

      {/* Sapaan (mobile) */}
      <section className="mb-5 relative overflow-hidden rounded-[20px] border border-gold-500/25 bg-neutral-950 p-5 text-white md:hidden">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative text-sm text-white/60">{me && !me.name ? "Selamat datang" : "Halo,"}</div>
        {/* Nama belum dimuat -> skeleton (bukan teks sementara) */}
        {!me ? <Skeleton className="relative mt-1 h-7 w-40 !bg-white/15" />
          : me.name && <div className="relative truncate bg-gradient-to-r from-gold-100 to-gold-400 bg-clip-text text-xl font-bold capitalize text-transparent">{me.name}</div>}
        <p className="relative mt-1 text-sm text-white/70">Abadikan momen berharga Anda bersama kami.</p>
        <Link to="/booking" className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-gold-300 to-gold-500 px-5 py-2 text-sm font-semibold text-neutral-950 active:scale-95">Booking sekarang</Link>
      </section>

      {loading && <OrdersSkeleton />}
      {error && <ErrorState message="Pesanan gagal dimuat." onRetry={() => retry()} />}

      {orders && orders.length === 0 && (
        <Card className="p-10 text-center">
          <p className="mb-4 text-neutral-500 dark:text-neutral-400">Anda belum memiliki pesanan.</p>
          <Link to="/booking" className={btnPrimary}>Booking sekarang</Link>
        </Card>
      )}

      <div className="space-y-4">
        {orders?.map((o) => {
          const event = o.invoice_details[0]?.events?.[0];
          return (
            <Card key={o.id} className="overflow-hidden max-md:active:opacity-70">
              {/* Bagian atas kartu: ketuk untuk membuka detail pesanan */}
              <Link to={`/account/orders/${o.id}`} className="block p-4 transition hover:bg-neutral-50 md:p-5 dark:hover:bg-neutral-800/50" aria-label={`Buka detail pesanan ${o.invoice_number}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{o.invoice_number}</div>
                    <div className="font-semibold">{o.invoice_details.map((d) => d.package?.name).filter(Boolean).join(", ") || "Pesanan"}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {o.cancel?.status === "approved" ? <CancelBadge status="approved" /> : <StatusBadge status={o.transaction_status} />}
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
              <Link to={`/account/orders/${o.id}/invoice`} className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-sm font-semibold text-gold-700 dark:border-neutral-800 dark:text-gold-400 md:px-5">
                <span className="inline-flex items-center gap-2"><FileText className="size-4" /> Lihat & unduh invoice</span>
                <ChevronRight className="size-4" />
              </Link>
            </Card>
          );
        })}
      </div>
    </>
  );
}
