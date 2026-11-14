import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactSelect from "react-select";
import dayjs from "dayjs";
import { HiOutlineTrash, HiPlus, HiSearch } from "react-icons/hi";

import DateTimeInput from "@components/DateTimeInput";
import { formattedCurrency } from "@helpers/currency";
import useCreate from "@services/admin/invoice/hooks/useCreate";
import useGetAllCustomer from "@services/admin/customer/hooks/useGetAll";
import { useCatalog } from "@services/customer/api";
import type { CatalogPackage } from "@services/customer/types";
import type { ICreatePayload } from "@services/admin/invoice/interfaces/create.type";
import CustomerFormModal from "../../../customer/Action/FormModal";
import { useModalParams } from "../../../shared/useModalParams";
import { btnGhost, btnPrimary, Field, inputCls, Stepper } from "../../../shared/ui";
import { panel } from "../../../shared/invoice-ui";

interface Line {
  key: string;
  pkg: CatalogPackage;
  quantity: number;
  date: string;
  location: string;
  note: string;
  addons: Record<string, number>;
}

interface CustomerRow { id: string; name: string; whatsapp: string }

let seq = 0;

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { catalog, loading: catalogLoading } = useCatalog();
  const { data: customers, setName: searchCustomer } = useGetAllCustomer();
  const { createData } = useCreate();
  const { openCreate: openNewCustomer } = useModalParams();

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [dp, setDp] = useState("0");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [addonOpen, setAddonOpen] = useState<string | null>(null);

  const addonMap = useMemo(() => new Map((catalog?.addons ?? []).map((a) => [a.id, a])), [catalog]);
  const customerOptions = useMemo(
    () => ((customers ?? []) as CustomerRow[]).map((c) => ({ value: c.id, label: `${c.name || "(tanpa nama)"} — ${c.whatsapp}` })),
    [customers]
  );

  const packages = useMemo(
    () =>
      (catalog?.packages ?? []).filter(
        (p) =>
          (category === "all" || p.package_category?.id === category) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [catalog, category, query]
  );

  const lineTotal = (l: Line) =>
    l.pkg.price_final * l.quantity +
    Object.entries(l.addons).reduce((s, [id, q]) => s + (addonMap.get(id)?.price ?? 0) * q, 0);
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const dpNum = Math.max(0, Number(dp) || 0);
  const dpTooBig = dpNum > subtotal;

  const patch = (key: string, p: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  const add = (pkg: CatalogPackage) =>
    setLines((ls) => [
      ...ls,
      { key: `l${++seq}`, pkg, quantity: 1, date: dayjs().add(1, "day").hour(9).minute(0).format("YYYY-MM-DDTHH:mm"), location: "", note: "", addons: {} },
    ]);

  const incomplete = lines.some((l) => !l.date || !l.location.trim());
  const canSubmit = !!customerId && lines.length > 0 && !incomplete && !dpTooBig && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const payload = {
      customer_id: customerId,
      amount_paid: dpNum,
      packages: lines.map((l) => ({
        id: l.pkg.id,
        quantity: l.quantity,
        date: dayjs(l.date).format("YYYY-MM-DD HH:mm:ss"),
        location: l.location.trim(),
        note: l.note.trim() || "-",
        package_addons: Object.entries(l.addons).filter(([, q]) => q > 0).map(([id, quantity]) => ({ id, quantity })),
      })),
    } as unknown as ICreatePayload;

    const { error, response } = await createData(payload);
    setSaving(false);
    if (error) {
      toast.error(error === "Server error" ? "Gagal membuat invoice." : error);
      return;
    }
    toast.success("Invoice berhasil dibuat.");
    navigate(`/admin/invoices/show/${response?.data?.data?.id ?? ""}`.replace(/\/$/, "") || "/admin/invoices");
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_400px]">
      <CustomerFormModal />
      {/* KIRI: katalog */}
      <section className={`${panel} space-y-4`}>
        <div>
          <h2 className="font-semibold">1. Pilih paket</h2>
          <p className="text-sm text-gray-500">Klik paket untuk menambahkannya. Paket yang sama boleh ditambahkan lagi untuk acara berbeda.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Cari paket..." value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputCls} pl-9`} />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", name: "Semua" }, ...(catalog?.categories ?? [])].map((c) => (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm ${category === c.id ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900" : "border-gray-300 hover:bg-gray-50 dark:border-gray-600"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {catalogLoading && <p className="py-10 text-center text-sm text-gray-500">Memuat paket...</p>}
        {!catalogLoading && packages.length === 0 && <p className="py-10 text-center text-sm text-gray-500">Paket tidak ditemukan.</p>}
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {packages.map((p) => {
            const count = lines.filter((l) => l.pkg.id === p.id).length;
            return (
              <button key={p.id} type="button" onClick={() => add(p)}
                className="group relative cursor-pointer rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-500 hover:shadow-sm dark:border-gray-700">
                {count > 0 && <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">{count}×</span>}
                <div className="text-xs text-gray-500">{p.package_category?.name}</div>
                <div className="font-medium">{p.name}</div>
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-gray-500">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{formattedCurrency(p.price_final)}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100"><HiPlus /> Tambah</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* KANAN: invoice */}
      <div className="space-y-5 xl:sticky xl:top-20">
        <section className={`${panel} space-y-3`}>
          <h2 className="font-semibold">2. Customer</h2>
          <ReactSelect
            options={customerOptions}
            value={customerOptions.find((o) => o.value === customerId) ?? null}
            onChange={(o) => setCustomerId(o?.value ?? "")}
            onInputChange={(v, meta) => { if (meta.action === "input-change") searchCustomer(v); }}
            placeholder="Cari nama / WhatsApp..."
            noOptionsMessage={() => "Customer tidak ditemukan"}
            filterOption={null}
            classNamePrefix="rs"
            styles={{ control: (b) => ({ ...b, borderRadius: 8, minHeight: 40, fontSize: 14 }), menu: (b) => ({ ...b, zIndex: 30 }) }}
          />
          <button type="button" onClick={openNewCustomer} className="text-xs text-blue-600 hover:underline cursor-pointer">+ Customer baru</button>
        </section>

        <section className={`${panel} space-y-4`}>
          <h2 className="font-semibold">3. Detail pesanan {lines.length > 0 && <span className="font-normal text-gray-500">({lines.length})</span>}</h2>
          {lines.length === 0 && <p className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">Belum ada paket. Pilih dari daftar di samping.</p>}

          {lines.map((l) => {
            const unused = (catalog?.addons ?? []).filter((a) => !(a.id in l.addons));
            return (
              <div key={l.key} className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{l.pkg.name}</div>
                    <div className="text-xs text-gray-500">{formattedCurrency(l.pkg.price_final)} / paket</div>
                  </div>
                  <button type="button" aria-label="Hapus" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><HiOutlineTrash size={18} /></button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Field label="Tanggal & jam acara">
                    <DateTimeInput value={l.date} onChange={(v) => patch(l.key, { date: v })} className={inputCls} />
                  </Field>
                  <Field label="Jumlah"><Stepper value={l.quantity} min={1} max={20} onChange={(v) => patch(l.key, { quantity: v })} /></Field>
                </div>
                <Field label="Lokasi">
                  <input value={l.location} maxLength={500} placeholder="Nama tempat / alamat" onChange={(e) => patch(l.key, { location: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Catatan (opsional)">
                  <input value={l.note} maxLength={1000} onChange={(e) => patch(l.key, { note: e.target.value })} className={inputCls} />
                </Field>

                <div>
                  <div className="mb-1.5 text-sm font-medium">Add-on</div>
                  {Object.entries(l.addons).map(([id, q]) => (
                    <div key={id} className="mb-1.5 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-700/40">
                      <div className="min-w-0 text-sm">
                        <div className="truncate">{addonMap.get(id)?.name}</div>
                        <div className="text-xs text-gray-500">{formattedCurrency((addonMap.get(id)?.price ?? 0) * q)}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Stepper value={q} min={1} max={20} onChange={(v) => patch(l.key, { addons: { ...l.addons, [id]: v } })} />
                        <button type="button" aria-label="Hapus add-on" className="cursor-pointer p-1.5 text-gray-400 hover:text-red-600"
                          onClick={() => patch(l.key, { addons: Object.fromEntries(Object.entries(l.addons).filter(([k]) => k !== id)) })}><HiOutlineTrash /></button>
                      </div>
                    </div>
                  ))}
                  {unused.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setAddonOpen(addonOpen === l.key ? null : l.key)}
                        aria-expanded={addonOpen === l.key}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      >
                        <HiPlus size={18} /> {addonOpen === l.key ? "Tutup daftar add-on" : "Tambah add-on"}
                      </button>
                      {addonOpen === l.key && (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {unused.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => patch(l.key, { addons: { ...l.addons, [a.id]: 1 } })}
                              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{a.name}</span>
                                <span className="text-xs text-gray-500">{formattedCurrency(a.price)}</span>
                              </span>
                              <HiPlus className="shrink-0 text-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-between border-t pt-2 text-sm">
                  <span className="text-gray-500">Subtotal</span><b>{formattedCurrency(lineTotal(l))}</b>
                </div>
              </div>
            );
          })}
        </section>

        <section className={`${panel} space-y-4`}>
          <h2 className="font-semibold">4. Pembayaran</h2>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total tagihan</span><b className="text-base">{formattedCurrency(subtotal)}</b></div>
          <Field label="Down payment" hint={dpTooBig ? undefined : "Isi 0 jika belum ada pembayaran."}>
            <input type="number" min={0} max={subtotal} value={dp} onChange={(e) => setDp(e.target.value)} className={inputCls} />
            {dpTooBig && <span className="mt-1 block text-xs text-red-600">Melebihi total tagihan.</span>}
          </Field>
          <div className="flex gap-2 text-xs">
            <button type="button" className={btnGhost + " !px-2.5 !py-1"} onClick={() => setDp("0")}>Belum bayar</button>
            <button type="button" className={btnGhost + " !px-2.5 !py-1"} disabled={!subtotal} onClick={() => setDp(String(Math.round(subtotal / 2)))}>50%</button>
            <button type="button" className={btnGhost + " !px-2.5 !py-1"} disabled={!subtotal} onClick={() => setDp(String(subtotal))}>Lunas</button>
          </div>
          <div className="flex justify-between border-t pt-3 text-sm"><span className="text-gray-500">Sisa tagihan</span><b className="text-red-600">{formattedCurrency(Math.max(0, subtotal - dpNum))}</b></div>

          <button type="button" onClick={submit} disabled={!canSubmit} className={`${btnPrimary} w-full`}>
            {saving ? "Menyimpan..." : "Buat invoice"}
          </button>
          {!canSubmit && !saving && (
            <p className="text-xs text-gray-500">
              {!customerId ? "Pilih customer. " : ""}{lines.length === 0 ? "Tambahkan minimal satu paket. " : ""}{incomplete ? "Lengkapi tanggal dan lokasi tiap paket." : ""}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
