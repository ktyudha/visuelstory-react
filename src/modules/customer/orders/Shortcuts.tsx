import { Link } from "react-router-dom";
import { Images, MessageCircle, PlusCircle, Wallet } from "lucide-react";
import dayjs from "dayjs";
import { formattedCurrency } from "@helpers/currency";
import type { Order } from "@services/customer/types";
import { ADMIN_WHATSAPP } from "../shared/ui";

const card =
  "relative flex flex-col gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-left shadow-sm transition active:scale-[0.97]";

/** Pintasan aksi untuk mode aplikasi (PWA): langsung ke hal yang paling sering dibutuhkan. */
export default function Shortcuts({ orders }: { orders: Order[] }) {
  // Foto siap tapi pilihan belum dikirim
  const toPick = orders.filter((o) => o.gallery_ready && !o.selection_submitted_at);
  // Tagihan terdekat yang belum lunas
  const unpaid = orders.filter((o) => o.remaining_paid > 0).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))[0];
  // Acara terdekat
  const next = orders
    .flatMap((o) => o.invoice_details.flatMap((d) => (d.events ?? []).map((e) => ({ e, o, name: d.package?.name }))))
    .filter((x) => dayjs(x.e.date).isAfter(dayjs()))
    .sort((a, b) => +new Date(a.e.date) - +new Date(b.e.date))[0];

  const pickTo = toPick.length === 1 ? `/account/orders/${toPick[0].id}/gallery` : "/account";
  const waPay = unpaid
    ? `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Halo Visuelstory, saya ingin konfirmasi pembayaran invoice ${unpaid.invoice_number} (sisa ${formattedCurrency(unpaid.remaining_paid)}).`)}`
    : `https://wa.me/${ADMIN_WHATSAPP}`;

  return (
    <section aria-label="Pintasan" className="mb-6 space-y-3">
      {next && (
        <Link to={`/account/orders/${next.o.id}`} className="block rounded-2xl bg-neutral-900 p-4 text-white shadow-sm active:scale-[0.99] dark:bg-white dark:text-neutral-900">
          <div className="text-xs uppercase tracking-wide opacity-70">Acara berikutnya</div>
          <div className="mt-0.5 font-semibold">{next.name}</div>
          <div className="text-sm opacity-80">{dayjs(next.e.date).format("dddd, D MMMM • HH:mm")}</div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to={pickTo} className={card}>
          {toPick.length > 0 && <span className="absolute right-3 top-3 grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{toPick.length}</span>}
          <Images className="size-6" />
          <span className="text-sm font-semibold">Pilih foto</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{toPick.length ? `${toPick.length} galeri siap` : "Belum ada foto siap"}</span>
        </Link>

        <Link to="/booking" className={card}>
          <PlusCircle className="size-6" />
          <span className="text-sm font-semibold">Booking baru</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Pilih paket &amp; jadwal</span>
        </Link>

        <a href={waPay} target="_blank" rel="noreferrer" className={card}>
          <Wallet className="size-6" />
          <span className="text-sm font-semibold">Konfirmasi bayar</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{unpaid ? `Sisa ${formattedCurrency(unpaid.remaining_paid)}` : "Tidak ada tagihan"}</span>
        </a>

        <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer" className={card}>
          <MessageCircle className="size-6" />
          <span className="text-sm font-semibold">Hubungi kami</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Chat WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
