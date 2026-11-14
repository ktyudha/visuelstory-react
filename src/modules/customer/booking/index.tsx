import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import BottomSheet from "@components/BottomSheet";
import SlotPicker from "../shared/SlotPicker";
import useCart, { type CartItem } from "./cart";
import { Addons, Field, PackageSheet, Stepper } from "./parts";
import ConfirmSheet from "@components/ConfirmSheet";
import { formattedCurrency } from "@helpers/currency";
import useGlobalStore from "@store/useStore";
import { createBooking, getApiError, useCatalog } from "@services/customer/api";
import type { CatalogAddon, CatalogPackage, Order } from "@services/customer/types";
import { CatalogSkeleton } from "../shared/skeletons";
import { ADMIN_WHATSAPP, btnGhost, btnPrimary, Card, ErrorState, inputCls } from "../shared/ui";

export default function Booking() {
  const { catalog, error, loading, retry } = useCatalog();
  const me = useGlobalStore((s) => s.me);

  const cart = useCart((s) => s.items);
  const patch = useCart((s) => s.patch);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const upsert = useCart((s) => s.upsert);
  const navigate = useNavigate();
  const [toRemove, setToRemove] = useState<string | null>(null); // id paket yang menunggu konfirmasi hapus
  const [detail, setDetail] = useState<CatalogPackage | null>(null); // paket yang rinciannya sedang dibuka
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"pick" | "checkout">("pick"); // 1. pilih paket & add-on, 2. checkout
  const [sheet, setSheet] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", address: "" });
  const [tried, setTried] = useState(false); // sudah menekan lanjut dengan isian belum lengkap
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const name = profile.name || me?.name || "";
  const addonMap = useMemo(() => new Map((catalog?.addons ?? []).map((a) => [a.id, a])), [catalog]);

  const packages = useMemo(
    () =>
      (catalog?.packages ?? []).filter(
        (p) =>
          (category === "all" || p.package_category?.id === category) &&
          `${p.name} ${p.description}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [catalog, category, query]
  );

  const lineTotal = (i: CartItem) =>
    i.pkg.price_final * i.quantity +
    Object.entries(i.addons).reduce((s, [id, q]) => s + (addonMap.get(id)?.price ?? 0) * q, 0);
  const total = cart.reduce((s, i) => s + lineTotal(i), 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  const find = (id: string) => cart.find((i) => i.pkg.id === id);
  const itemErrors = (i: CartItem) => ({
    date: !i.date ? "Pilih tanggal & jam acara." : !dayjs(i.date).isAfter(dayjs()) ? "Waktu acara harus di masa depan." : "",
    location: i.location.trim().length < 3 ? "Isi lokasi acara (minimal 3 huruf)." : "",
  });
  const detailsOk = cart.length > 0 && cart.every((i) => i.date && dayjs(i.date).isAfter(dayjs()) && i.location.trim().length > 2);
  const profileOk = name.trim().length > 1;
  const valid = detailsOk && profileOk;

  // Tanpa paket tidak ada yang bisa di-checkout
  const checkout = stage === "checkout" && cart.length > 0;
  const goTo = (s: "pick" | "checkout") => {
    setStage(s); setTried(false); setSheet(false);
    window.scrollTo({ top: 0 });
    document.querySelector("main")?.scrollTo({ top: 0 });
  };

  /** Validasi dulu: kalau belum lengkap, tandai isian yang kurang & gulir ke sana. */
  const attempt = (action: () => void, needs: "details" | "all") => {
    const missing = cart.find((i) => itemErrors(i).date || itemErrors(i).location);
    if (missing || (needs === "all" && !profileOk)) {
      setTried(true);
      toast.error(missing ? "Lengkapi tanggal & lokasi dulu." : "Isi nama pemesan dulu.");
      requestAnimationFrame(() =>
        document.getElementById(missing ? `item-${missing.pkg.id}` : "field-name")?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      return;
    }
    action();
  };

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const order = await createBooking({
        name: name.trim(),
        email: profile.email.trim() || undefined,
        address: profile.address.trim() || undefined,
        packages: cart.map((i) => ({
          id: i.pkg.id,
          quantity: i.quantity,
          date: dayjs(i.date).format("YYYY-MM-DD HH:mm:ss"),
          location: i.location.trim(),
          note: i.note.trim() || undefined,
          package_addons: Object.entries(i.addons).filter(([, q]) => q > 0).map(([id, quantity]) => ({ id, quantity })),
        })),
      });
      setDone(order);
      clear();
      window.scrollTo({ top: 0 });
      document.querySelector("main")?.scrollTo({ top: 0 });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const wa = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
      `Halo Visuelstory, saya sudah booking dengan nomor invoice ${done.invoice_number} (total ${formattedCurrency(done.total_price)}). Mohon info pembayaran DP.`
    )}`;
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <Metadata title="Booking Berhasil" />
        <CheckCircle2 className="mx-auto mb-4 size-14 text-emerald-600 dark:text-emerald-400" />
        <h1 className="mb-1 text-2xl font-bold">Booking diterima!</h1>
        <p className="mb-6 text-neutral-500 dark:text-neutral-400">Nomor invoice <b>{done.invoice_number}</b></p>
        <div className="mb-6 flex justify-between rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-950">
          <span className="text-neutral-500 dark:text-neutral-400">Total</span>
          <b>{formattedCurrency(done.total_price)}</b>
        </div>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
          Langkah selanjutnya: konfirmasi &amp; lakukan pembayaran DP via WhatsApp agar jadwal Anda dikunci.
        </p>
        <div className="flex flex-col gap-3">
          <a href={wa} target="_blank" rel="noreferrer" className={btnPrimary}>Konfirmasi via WhatsApp</a>
          <Link to={`/account/orders/${done.id}`} className={btnGhost}>Lihat pesanan</Link>
        </div>
      </Card>
    );
  }

  // Tombol aksi bar bawah (mobile)
  const next = checkout
    ? { label: submitting ? "Mengirim..." : "Kirim booking", disabled: submitting, onClick: () => attempt(submit, "all") }
    : { label: "Checkout", disabled: cart.length === 0, onClick: () => goTo("checkout") };

  return (
    <div className={clsx(cart.length > 0 ? "pb-20 lg:pb-0" : "")}>
      <Metadata title="Booking" />
      <h1 className="hidden text-2xl font-bold md:block">Booking Sesi Foto</h1>
      <p className="mb-5 hidden text-neutral-500 dark:text-neutral-400 md:mb-8 md:block">Pilih paket &amp; add-on, lalu checkout untuk isi jadwal &amp; data pemesan. Harga final dihitung otomatis.</p>

      {loading && <CatalogSkeleton />}
      {error && <ErrorState message="Katalog paket gagal dimuat." onRetry={() => retry()} />}

      {catalog && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="min-w-0 space-y-7">
            {/* ===== Langkah 1: pilih paket & add-on ===== */}
            {!checkout && <section>
              <h2 className="mb-3 font-semibold">Pilih paket</h2>

              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari paket..." className={`${inputCls} !pl-10`} />
              </div>
              {/* Kategori: tab bergaris bawah, jumlah paket di tiap kategori */}
              <div role="tablist" aria-label="Kategori paket" className="-mx-4 mb-4 flex gap-6 overflow-x-auto border-b border-neutral-200 px-4 [scrollbar-width:none] md:mx-0 md:px-0 dark:border-neutral-800 [&::-webkit-scrollbar]:hidden">
                {[{ id: "all", name: "Semua" }, ...catalog.categories].map((c) => {
                  const n = c.id === "all" ? catalog.packages.length : catalog.packages.filter((p) => p.package_category?.id === c.id).length;
                  const active = category === c.id;
                  return (
                    <button key={c.id} role="tab" aria-selected={active} type="button" onClick={() => setCategory(c.id)}
                      className={clsx("relative shrink-0 cursor-pointer whitespace-nowrap pb-3 pt-1 text-sm transition-colors",
                        active ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200")}>
                      {c.name} <span className={clsx("ml-0.5 text-xs", active ? "text-gold-700 dark:text-gold-400" : "text-neutral-400")}>{n}</span>
                      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gold-500" />}
                    </button>
                  );
                })}
              </div>

              {packages.length === 0 && <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">Paket tidak ditemukan.</p>}
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                {packages.map((p) => {
                  const item = find(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => setDetail(p)}
                      className={clsx("block w-full min-w-0 cursor-pointer break-words rounded-2xl border bg-white p-4 text-left transition active:scale-[0.99] dark:bg-neutral-900",
                        item ? "border-gold-500 ring-2 ring-gold-500/20" : "border-neutral-200 dark:border-neutral-800")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">{p.package_category?.name}</div>
                          <div className="font-semibold">{p.name}</div>
                        </div>
                        {item && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-700 dark:text-gold-400"><Check className="size-3.5" /> × {item.quantity}</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-neutral-500 dark:text-neutral-400">{p.description}</p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold">{formattedCurrency(p.price_final)}</span>
                          {p.discount > 0 && <span className="text-xs text-neutral-400 line-through dark:text-neutral-500">{formattedCurrency(p.price)}</span>}
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-sm font-medium text-gold-700 dark:text-gold-400">Lihat detail <ChevronRight className="size-4" /></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>}

            {/* ===== Langkah 2: checkout ===== */}
            {checkout && (
              <button type="button" onClick={() => goTo("pick")} className="inline-flex cursor-pointer items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                <ChevronLeft className="size-4" /> Tambah / ubah paket
              </button>
            )}

            {checkout && (
              <section className="space-y-4">
                <h2 className="font-semibold">Detail acara</h2>
                {cart.map((i) => (
                  <Card key={i.pkg.id} id={`item-${i.pkg.id}`} className={clsx("overflow-hidden scroll-mt-24", tried && (itemErrors(i).date || itemErrors(i).location) && "!border-red-400")}>
                    {/* Kepala kartu */}
                    <div className="flex items-start justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50 sm:px-5">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{i.pkg.name}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{formattedCurrency(i.pkg.price_final)} × {i.quantity}</div>
                      </div>
                      <button type="button" onClick={() => remove(i.pkg.id)} className="-mr-2 cursor-pointer rounded-lg p-2 text-neutral-400 hover:text-red-600" aria-label="Hapus paket"><Trash2 className="size-4" /></button>
                    </div>

                    {/* Isian: satu kolom, tinggi & lebar seragam */}
                    <div className="space-y-4 px-4 py-4 sm:px-5">
                      <Field label="Tanggal & jam acara" error={tried ? itemErrors(i).date : ""}>
                        <SlotPicker value={i.date} onChange={(v) => patch(i.pkg.id, { date: v })} others={cart.filter((c) => c.pkg.id !== i.pkg.id && c.date).map((c) => c.date)} invalid={!!(tried && itemErrors(i).date)} className={fieldCls} />
                      </Field>
                      <Field label="Lokasi acara" error={tried ? itemErrors(i).location : ""}>
                        <input maxLength={500} placeholder="Nama tempat / alamat lengkap" value={i.location} onChange={(e) => patch(i.pkg.id, { location: e.target.value })} className={clsx(fieldCls, tried && itemErrors(i).location && errCls)} />
                      </Field>
                      <Field label="Catatan" optional>
                        <textarea rows={2} maxLength={1000} placeholder="Konsep, request khusus, dll." value={i.note} onChange={(e) => patch(i.pkg.id, { note: e.target.value })} className={inputCls} />
                      </Field>
                      <Addons addons={catalog.addons} value={i.addons} onChange={(a) => patch(i.pkg.id, { addons: a })} />
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950/50 sm:px-5">
                      <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                      <b>{formattedCurrency(lineTotal(i))}</b>
                    </div>
                  </Card>
                ))}
              </section>
            )}

            {/* ===== Tinjau (mobile) ===== */}
            {checkout && (
              <section className="space-y-4 lg:hidden">
                <ReviewList cart={cart} addonMap={addonMap} lineTotal={lineTotal} onRemove={setToRemove} />
                <div className="flex justify-between rounded-2xl bg-neutral-900 p-4 text-white dark:bg-white dark:text-neutral-900">
                  <span>Total</span><b className="text-lg">{formattedCurrency(total)}</b>
                </div>
              </section>
            )}

            {/* ===== Data pemesan ===== */}
            {checkout && <section>
              <h2 className="mb-3 font-semibold">Data pemesan</h2>
              <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <div id="field-name" className="scroll-mt-24 sm:col-span-2"><Field label="Nama lengkap" error={tried && !profileOk ? "Isi nama lengkap Anda." : ""}>
                  <input maxLength={120} value={name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={clsx(fieldCls, tried && !profileOk && errCls)} />
                </Field></div>
                <Field label="WhatsApp">
                  <input disabled value={me?.whatsapp ?? ""} className={`${fieldCls} bg-neutral-100 text-neutral-500 dark:bg-neutral-800`} />
                </Field>
                <Field label="Email" optional>
                  <input type="email" maxLength={160} value={profile.email || me?.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={fieldCls} />
                </Field>
                <div className="sm:col-span-2"><Field label="Alamat" optional>
                  <input maxLength={255} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={fieldCls} />
                </Field></div>
              </Card>
            </section>}
          </div>

          {/* ===== Ringkasan (desktop) ===== */}
          <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:block">
            <Card className="p-5">
              <h2 className="mb-4 font-semibold">Ringkasan</h2>
              {cart.length === 0 ? <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada paket dipilih.</p> : <ReviewList cart={cart} addonMap={addonMap} lineTotal={lineTotal} compact onRemove={setToRemove} />}
              <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total</span>
                <span className="text-xl font-bold">{formattedCurrency(total)}</span>
              </div>
              <button type="button" onClick={next.onClick} disabled={next.disabled} className={`${btnPrimary} mt-5 w-full`}>{next.label}</button>
            </Card>
          </aside>
        </div>
      )}

      {/* ===== Bar aksi menempel (mobile): ringkasan terpilih + lanjut ===== */}
      {catalog && cart.length > 0 && (
        <div className="glass fixed inset-x-4 bottom-[calc(var(--tab-bottom)+4.5rem)] z-30 mx-auto max-w-sm rounded-2xl lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-2.5">
            <button onClick={() => setSheet(true)} disabled={cart.length === 0} className="min-w-0 flex-1 cursor-pointer text-left" aria-label="Lihat ringkasan pilihan">
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="grid min-w-5 place-items-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold text-neutral-950">{count}</span>
                paket dipilih <ChevronUp className="size-3.5" />
              </div>
              <div className="truncate font-bold">{formattedCurrency(total)}</div>
            </button>
            <button onClick={next.onClick} disabled={next.disabled} className={`${btnPrimary} shrink-0`}>{next.label}</button>
          </div>
        </div>
      )}

      {/* ===== Konfirmasi hapus paket ===== */}
      {toRemove && (
        <ConfirmSheet title="Hapus paket ini?" message={`${find(toRemove)?.pkg.name ?? "Paket"} beserta add-on dan jadwalnya akan dihapus dari pesanan.`} confirmLabel="Ya, hapus" danger
          onConfirm={() => { remove(toRemove); setToRemove(null); }} onClose={() => setToRemove(null)} />
      )}

      {/* ===== Rincian paket ===== */}
      {detail && (() => {
        const item = find(detail.id);
        return (
          <PackageSheet pkg={detail} onClose={() => setDetail(null)}>
            {item ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gold-500 p-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 dark:text-gold-400"><Check className="size-4" /> Sudah dipilih × {item.quantity}</span>
                  <button onClick={() => { remove(detail.id); setDetail(null); }} aria-label="Hapus" className="cursor-pointer p-2 text-neutral-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                </div>
                <button onClick={() => navigate(`/booking/package/${detail.id}`)} className={`${btnPrimary} w-full`}>Atur jumlah &amp; add-on</button>
              </>
            ) : (
              <>
                <button onClick={() => { upsert(detail, 1, {}); setDetail(null); }} className={`${btnPrimary} w-full`}><Plus className="size-4" /> Pilih paket ini</button>
                <button onClick={() => navigate(`/booking/package/${detail.id}`)} className={`${btnGhost} w-full`}>Pilih &amp; atur add-on</button>
              </>
            )}
            <button onClick={() => setDetail(null)} className={`${btnGhost} w-full`}>Tutup</button>
          </PackageSheet>
        );
      })()}

      {/* ===== Sheet ringkasan (mobile) ===== */}
      {sheet && (
        <BottomSheet label="Ringkasan pilihan" onClose={() => setSheet(false)}>
          <h2 className="mb-1 text-lg font-bold">Pilihan Anda</h2>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">{count} paket · ubah jumlah atau hapus di sini.</p>
          <ul className="space-y-3">
            {cart.map((i) => (
              <li key={i.pkg.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => navigate(`/booking/package/${i.pkg.id}`)} className="min-w-0 cursor-pointer text-left" aria-label={`Atur add-on ${i.pkg.name}`}>
                    <div className="flex items-center gap-0.5 font-medium"><span className="truncate">{i.pkg.name}</span><ChevronRight className="size-4 shrink-0 text-neutral-400" /></div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{formattedCurrency(i.pkg.price_final)} / paket{Object.values(i.addons).some((q) => q > 0) ? " · + add-on" : ""}</div>
                  </button>
                  <b className="shrink-0">{formattedCurrency(lineTotal(i))}</b>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Stepper value={i.quantity} min={1} max={20} onChange={(v) => patch(i.pkg.id, { quantity: v })} />
                  <button onClick={() => { remove(i.pkg.id); if (cart.length === 1) setSheet(false); }} className="inline-flex cursor-pointer items-center gap-1 text-sm text-red-600 dark:text-red-400"><Trash2 className="size-4" /> Hapus</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="my-4 flex items-baseline justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <span className="text-neutral-500 dark:text-neutral-400">Total</span><b className="text-xl">{formattedCurrency(total)}</b>
          </div>
          <div className="grid gap-2">
            {!checkout && <button onClick={() => goTo("checkout")} className={`${btnPrimary}`}>Checkout</button>}
            <button onClick={() => goTo("pick")} className={`${btnGhost}`}><Plus className="size-4" /> Tambah / cari paket lagi</button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

/** Daftar ringkas item + jadwal + add-on (tinjau mobile & ringkasan desktop). */
function ReviewList({ cart, addonMap, lineTotal, compact, onRemove }: { cart: CartItem[]; addonMap: Map<string, CatalogAddon>; lineTotal: (i: CartItem) => number; compact?: boolean; onRemove?: (id: string) => void }) {
  return (
    <ul className={clsx("text-sm", compact ? "space-y-3" : "space-y-3")}>
      {cart.map((i) => (
        <li key={i.pkg.id} className={clsx(!compact && "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900")}>
          <div className="flex justify-between gap-2">
            <span className="font-medium">{i.pkg.name} × {i.quantity}</span>
            <span className="flex shrink-0 items-center gap-1">
              <span className="font-medium">{formattedCurrency(i.pkg.price_final * i.quantity)}</span>
              {onRemove && <button type="button" aria-label={`Hapus ${i.pkg.name}`} onClick={() => onRemove(i.pkg.id)} className="-mr-1.5 grid size-7 cursor-pointer place-items-center rounded-md text-neutral-400 hover:text-red-600"><Trash2 className="size-4" /></button>}
            </span>
          </div>
          {Object.entries(i.addons).filter(([, q]) => q > 0).map(([id, q]) => (
            <div key={id} className="flex justify-between gap-2 pl-3 text-neutral-500 dark:text-neutral-400">
              <span>+ {addonMap.get(id)?.name} × {q}</span><span>{formattedCurrency((addonMap.get(id)?.price ?? 0) * q)}</span>
            </div>
          ))}
          {i.date && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"><CalendarDays className="size-3.5 shrink-0" /> {dayjs(i.date).format("dddd, D MMM YYYY • HH:mm")}</div>}
          {i.location && <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"><MapPin className="size-3.5 shrink-0" /> <span className="truncate">{i.location}</span></div>}
          {!compact && <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800"><span className="text-neutral-500 dark:text-neutral-400">Subtotal</span><b>{formattedCurrency(lineTotal(i))}</b></div>}
        </li>
      ))}
    </ul>
  );
}

/** Input satu baris: tinggi 44px (nyaman disentuh) */
const fieldCls = `${inputCls} h-11`;
const errCls = "!border-red-500 focus:!ring-red-500/20";
