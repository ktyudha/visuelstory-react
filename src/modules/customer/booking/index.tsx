import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, MapPin, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Metadata from "@components/Metadata";
import BottomSheet from "@components/BottomSheet";
import SlotPicker from "../shared/SlotPicker";
import { formattedCurrency } from "@helpers/currency";
import useGlobalStore from "@store/useStore";
import { createBooking, getApiError, useCatalog } from "@services/customer/api";
import type { CatalogAddon, CatalogPackage, Order } from "@services/customer/types";
import { ADMIN_WHATSAPP, btnGhost, btnPrimary, Card, ErrorState, inputCls, Spinner } from "../shared/ui";

interface CartItem {
  pkg: CatalogPackage;
  quantity: number;
  date: string;
  location: string;
  note: string;
  addons: Record<string, number>; // addonId -> qty
}

type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Pilih paket" },
  { n: 2, label: "Jadwal & detail" },
  { n: 3, label: "Tinjau & kirim" },
];

export default function Booking() {
  const { catalog, error, loading, retry } = useCatalog();
  const me = useGlobalStore((s) => s.me);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [sheet, setSheet] = useState(false);
  const [detail, setDetail] = useState<CatalogPackage | null>(null); // paket yang detailnya sedang dibuka
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
  const patch = (id: string, p: Partial<CartItem>) => setCart((c) => c.map((i) => (i.pkg.id === id ? { ...i, ...p } : i)));
  const add = (pkg: CatalogPackage) => setCart((c) => [...c, { pkg, quantity: 1, date: "", location: "", note: "", addons: {} }]);
  const remove = (id: string) => setCart((c) => c.filter((i) => i.pkg.id !== id));

  const itemErrors = (i: CartItem) => ({
    date: !i.date ? "Pilih tanggal & jam acara." : !dayjs(i.date).isAfter(dayjs()) ? "Waktu acara harus di masa depan." : "",
    location: i.location.trim().length < 3 ? "Isi lokasi acara (minimal 3 huruf)." : "",
  });
  const detailsOk = cart.length > 0 && cart.every((i) => i.date && dayjs(i.date).isAfter(dayjs()) && i.location.trim().length > 2);
  const profileOk = name.trim().length > 1;
  const valid = detailsOk && profileOk;

  const go = (s: Step) => { setStep(s); setTried(false); setSheet(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

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
      window.scrollTo({ top: 0 });
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

  // Tombol aksi bar bawah (mobile) sesuai langkah
  const next =
    step === 1 ? { label: "Lanjut isi jadwal", disabled: cart.length === 0, onClick: () => go(2) }
    : step === 2 ? { label: "Lanjut tinjau", disabled: false, onClick: () => attempt(() => go(3), "details") }
    : { label: submitting ? "Mengirim..." : "Kirim booking", disabled: submitting, onClick: () => attempt(submit, "all") };

  return (
    <div className={clsx(cart.length > 0 || step > 1 ? "pb-24 lg:pb-0" : "")}>
      <Metadata title="Booking" />
      <h1 className="hidden text-2xl font-bold md:block">Booking Sesi Foto</h1>
      <p className="mb-5 hidden text-neutral-500 dark:text-neutral-400 md:mb-8 md:block">Pilih paket, isi jadwal &amp; lokasi, lalu kirim. Harga final dihitung otomatis.</p>

      {/* Progres langkah (mobile) */}
      <nav aria-label="Langkah booking" className="mb-5 lg:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          {step > 1 ? (
            <button onClick={() => go((step - 1) as Step)} className="inline-flex cursor-pointer items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <ChevronLeft className="size-4" /> Kembali
            </button>
          ) : <span />}
          <span className="font-medium">Langkah {step} dari 3 · {STEPS[step - 1].label}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden>
          {STEPS.map((s) => <div key={s.n} className={clsx("h-1.5 rounded-full transition-colors", s.n <= step ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800")} />)}
        </div>
      </nav>

      {loading && <Spinner />}
      {error && <ErrorState message="Katalog paket gagal dimuat." onRetry={() => retry()} />}

      {catalog && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="min-w-0 space-y-7">
            {/* ===== 1. Pilih paket ===== */}
            <section className={clsx(step !== 1 && "hidden lg:block")}>
              <h2 className="mb-3 hidden font-semibold lg:block">1. Pilih paket</h2>

              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari paket..." className={`${inputCls} !pl-10`} />
              </div>
              <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
                {[{ id: "all", name: "Semua" }, ...catalog.categories].map((c) => (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                    className={clsx("shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm",
                      category === c.id ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800")}>
                    {c.name}
                  </button>
                ))}
              </div>

              {packages.length === 0 && <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">Paket tidak ditemukan.</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {packages.map((p) => {
                  const item = find(p.id);
                  return (
                    <div key={p.id} className={clsx("min-w-0 break-words rounded-2xl border bg-white p-4 transition dark:bg-neutral-900",
                      item ? "border-neutral-900 ring-2 ring-neutral-900/10 dark:border-white" : "border-neutral-200 dark:border-neutral-800")}>
                      <div className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">{p.package_category?.name}</div>
                      <div className="font-semibold">{p.name}</div>
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-neutral-500 dark:text-neutral-400">{p.description}</p>
                      <button type="button" onClick={() => setDetail(p)} className="mt-1 inline-flex cursor-pointer items-center gap-0.5 text-sm font-medium text-neutral-900 underline underline-offset-4 dark:text-white">
                        Lihat detail <ChevronRight className="size-4" />
                      </button>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-bold">{formattedCurrency(p.price_final)}</span>
                        {p.discount > 0 && <span className="text-xs text-neutral-400 line-through dark:text-neutral-500">{formattedCurrency(p.price)}</span>}
                      </div>

                      {item ? (
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><Check className="size-4" /> Dipilih</span>
                          <div className="flex items-center gap-2">
                            <Stepper value={item.quantity} min={1} max={20} onChange={(v) => patch(p.id, { quantity: v })} />
                            <button type="button" aria-label="Hapus" onClick={() => remove(p.id)} className="cursor-pointer rounded-lg p-2 text-neutral-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => add(p)} className={`${btnPrimary} mt-3 w-full`}><Plus className="size-4" /> Pilih paket</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===== 2. Detail acara ===== */}
            {cart.length > 0 && (
              <section className={clsx("space-y-4", step !== 2 && "hidden lg:block lg:space-y-4")}>
                <h2 className="hidden font-semibold lg:block">2. Detail acara</h2>
                {cart.map((i) => (
                  <Card key={i.pkg.id} id={`item-${i.pkg.id}`} className={clsx("overflow-hidden scroll-mt-24", tried && (itemErrors(i).date || itemErrors(i).location) && "!border-red-400")}>
                    {/* Kepala kartu */}
                    <div className="flex items-start justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50 sm:px-5">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{i.pkg.name}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{formattedCurrency(i.pkg.price_final)} / paket</div>
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
                      <Field label="Jumlah paket">
                        <QuantityField value={i.quantity} min={1} max={20} onChange={(v) => patch(i.pkg.id, { quantity: v })} />
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

            {/* ===== 3. Tinjau (mobile) ===== */}
            {step === 3 && (
              <section className="space-y-4 lg:hidden">
                <ReviewList cart={cart} addonMap={addonMap} lineTotal={lineTotal} />
                <div className="flex justify-between rounded-2xl bg-neutral-900 p-4 text-white dark:bg-white dark:text-neutral-900">
                  <span>Total</span><b className="text-lg">{formattedCurrency(total)}</b>
                </div>
              </section>
            )}

            {/* ===== Data pemesan ===== */}
            <section className={clsx(step !== 3 && "hidden lg:block")}>
              <h2 className="mb-3 font-semibold"><span className="hidden lg:inline">3. </span>Data pemesan</h2>
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
            </section>
          </div>

          {/* ===== Ringkasan (desktop) ===== */}
          <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:block">
            <Card className="p-5">
              <h2 className="mb-4 font-semibold">Ringkasan</h2>
              {cart.length === 0 ? <p className="text-sm text-neutral-500 dark:text-neutral-400">Belum ada paket dipilih.</p> : <ReviewList cart={cart} addonMap={addonMap} lineTotal={lineTotal} compact />}
              <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total</span>
                <span className="text-xl font-bold">{formattedCurrency(total)}</span>
              </div>
              <button type="button" onClick={() => attempt(submit, "all")} disabled={submitting || cart.length === 0} className={`${btnPrimary} mt-5 w-full`}>{submitting ? "Mengirim..." : "Kirim booking"}</button>
            </Card>
          </aside>
        </div>
      )}

      {/* ===== Bar aksi menempel (mobile): ringkasan terpilih + lanjut ===== */}
      {catalog && (cart.length > 0 || step > 1) && (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-3 lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 pl-3 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
            <button onClick={() => setSheet(true)} disabled={cart.length === 0} className="min-w-0 flex-1 cursor-pointer text-left" aria-label="Lihat ringkasan pilihan">
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="grid min-w-5 place-items-center rounded-full bg-neutral-900 px-1.5 text-[11px] font-bold text-white dark:bg-white dark:text-neutral-900">{count}</span>
                paket dipilih <ChevronUp className="size-3.5" />
              </div>
              <div className="truncate font-bold">{formattedCurrency(total)}</div>
            </button>
            <button onClick={next.onClick} disabled={next.disabled} className={`${btnPrimary} shrink-0 px-5 py-3`}>{next.label}</button>
          </div>
        </div>
      )}

      {/* ===== Detail paket ===== */}
      {detail && (() => {
        const item = find(detail.id);
        const points = detail.description.split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
        return (
          <BottomSheet label={`Detail ${detail.name}`} onClose={() => setDetail(null)}>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{detail.package_category?.name}</div>
            <h2 className="text-xl font-bold leading-tight">{detail.name}</h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="text-2xl font-bold">{formattedCurrency(detail.price_final)}</span>
              {detail.discount > 0 && (
                <>
                  <span className="text-sm text-neutral-400 line-through dark:text-neutral-500">{formattedCurrency(detail.price)}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">Hemat {detail.discount}%</span>
                </>
              )}
            </div>

            <h3 className="mb-2 mt-5 text-sm font-semibold">Yang Anda dapatkan</h3>
            <ul className="space-y-2 text-sm">
              {points.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /><span className="min-w-0 break-words">{t}</span></li>
              ))}
              {points.length === 0 && <li className="text-neutral-500 dark:text-neutral-400">Belum ada rincian untuk paket ini.</li>}
            </ul>

            {catalog && catalog.addons.length > 0 && (
              <p className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
                Add-on opsional (mis. {catalog.addons.slice(0, 2).map((a) => a.name).join(", ")}) bisa ditambahkan di langkah berikutnya.
              </p>
            )}

            <div className="mt-6 space-y-2">
              {item ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-900 p-3 dark:border-white">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><Check className="size-4" /> Sudah dipilih</span>
                  <div className="flex items-center gap-2">
                    <Stepper value={item.quantity} min={1} max={20} onChange={(v) => patch(detail.id, { quantity: v })} />
                    <button onClick={() => { remove(detail.id); setDetail(null); }} aria-label="Hapus" className="cursor-pointer p-2 text-neutral-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { add(detail); setDetail(null); }} className={`${btnPrimary} w-full py-3`}><Plus className="size-4" /> Pilih paket ini</button>
              )}
              <button onClick={() => setDetail(null)} className={`${btnGhost} w-full py-3`}>Tutup</button>
            </div>
          </BottomSheet>
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
                  <div className="min-w-0">
                    <div className="truncate font-medium">{i.pkg.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{formattedCurrency(i.pkg.price_final)} / paket</div>
                  </div>
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
            {step === 1 && <button onClick={() => go(2)} className={`${btnPrimary} py-3`}>Lanjut isi jadwal</button>}
            <button onClick={() => { setSheet(false); if (step !== 1) go(1); }} className={`${btnGhost} py-3`}><Plus className="size-4" /> Tambah / cari paket lagi</button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

/** Daftar ringkas item + jadwal + add-on (tinjau mobile & ringkasan desktop). */
function ReviewList({ cart, addonMap, lineTotal, compact }: { cart: CartItem[]; addonMap: Map<string, CatalogAddon>; lineTotal: (i: CartItem) => number; compact?: boolean }) {
  return (
    <ul className={clsx("text-sm", compact ? "space-y-3" : "space-y-3")}>
      {cart.map((i) => (
        <li key={i.pkg.id} className={clsx(!compact && "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900")}>
          <div className="flex justify-between gap-2">
            <span className="font-medium">{i.pkg.name} × {i.quantity}</span>
            <span className="font-medium">{formattedCurrency(i.pkg.price_final * i.quantity)}</span>
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

function Addons({ addons, value, onChange }: { addons: CatalogAddon[]; value: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  if (addons.length === 0) return null;
  return (
    <Field label="Add-on" optional>
      <div className="space-y-2">
        {addons.map((a) => {
          const q = value[a.id] ?? 0;
          return (
            <div key={a.id} className={clsx("flex min-h-14 items-center justify-between gap-3 rounded-xl border px-3 py-2 transition", q > 0 ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-950" : "border-neutral-200 dark:border-neutral-800")}>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{a.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{formattedCurrency(a.price)}</div>
              </div>
              {q === 0 ? (
                <button type="button" onClick={() => onChange({ ...value, [a.id]: 1 })} className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"><Plus className="size-3.5" /> Tambah</button>
              ) : (
                <Stepper value={q} min={0} max={20} onChange={(v) => onChange({ ...value, [a.id]: v })} />
              )}
            </div>
          );
        })}
      </div>
    </Field>
  );
}

/** Stepper kompak (tinggi 36px) untuk baris padat: kartu paket, add-on, sheet ringkasan. */
function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <button type="button" aria-label="Kurangi" disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-full w-9 cursor-pointer place-items-center disabled:opacity-30"><Minus className="size-4" /></button>
      <span className="w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="Tambah" disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-full w-9 cursor-pointer place-items-center disabled:opacity-30"><Plus className="size-4" /></button>
    </div>
  );
}

/** Kotak jumlah selebar kolom, tinggi & gaya sama dengan input lain. */
function QuantityField({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="grid h-11 grid-cols-[2.75rem_1fr_2.75rem] items-center overflow-hidden rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <button type="button" aria-label="Kurangi" disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-full cursor-pointer place-items-center border-r border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-800 dark:hover:bg-neutral-800"><Minus className="size-4" /></button>
      <span className="text-center text-sm font-semibold tabular-nums">{value} <span className="font-normal text-neutral-500 dark:text-neutral-400">paket</span></span>
      <button type="button" aria-label="Tambah" disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-full cursor-pointer place-items-center border-l border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-800 dark:hover:bg-neutral-800"><Plus className="size-4" /></button>
    </div>
  );
}

/** Label + kontrol dengan jarak seragam. */
function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="block min-w-0 text-sm">
      <span className="mb-1.5 block font-medium">{label}{optional && <span className="font-normal text-neutral-400 dark:text-neutral-500"> (opsional)</span>}</span>
      {children}
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/** Input satu baris: tinggi 44px (nyaman disentuh) */
const fieldCls = `${inputCls} h-11`;
const errCls = "!border-red-500 focus:!ring-red-500/20";
