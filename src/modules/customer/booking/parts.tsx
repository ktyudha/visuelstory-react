import { Check, Minus, Plus } from "lucide-react";
import clsx from "clsx";
import { formattedCurrency } from "@helpers/currency";
import BottomSheet from "@components/BottomSheet";
import type { CatalogAddon, CatalogPackage } from "@services/customer/types";

export function Addons({ addons, value, onChange }: { addons: CatalogAddon[]; value: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  if (addons.length === 0) return null;
  return (
    <Field label="Add-on" optional>
      <div className="space-y-2">
        {addons.map((a) => {
          const q = value[a.id] ?? 0;
          return (
            <div key={a.id} className={clsx("flex min-h-14 items-center justify-between gap-3 rounded-xl border px-3 py-2 transition", q > 0 ? "border-gold-500 bg-gold-50 dark:bg-gold-950/40" : "border-neutral-200 dark:border-neutral-800")}>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{a.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{formattedCurrency(a.price)}</div>
              </div>
              <Stepper value={q} min={0} max={20} onChange={(v) => onChange({ ...value, [a.id]: v })} />
            </div>
          );
        })}
      </div>
    </Field>
  );
}

/** Stepper kompak (tinggi 36px) untuk baris padat: kartu paket, add-on, sheet ringkasan. */
export function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <button type="button" aria-label="Kurangi" disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-full w-9 cursor-pointer place-items-center disabled:opacity-30"><Minus className="size-4" /></button>
      <span className="w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="Tambah" disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-full w-9 cursor-pointer place-items-center disabled:opacity-30"><Plus className="size-4" /></button>
    </div>
  );
}

/** Label + kontrol dengan jarak seragam. */
export function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="block min-w-0 text-sm">
      <span className="mb-1.5 block font-medium">{label}{optional && <span className="font-normal text-neutral-400 dark:text-neutral-500"> (opsional)</span>}</span>
      {children}
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}


/** Bottom sheet rincian paket (harga, diskon, isi paket). `children` = tombol aksi di bawah. */
export function PackageSheet({ pkg, onClose, children }: { pkg: CatalogPackage; onClose: () => void; children?: React.ReactNode }) {
  const points = pkg.description.split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);
  return (
    <BottomSheet label={`Detail ${pkg.name}`} onClose={onClose}>
      <div className="text-xs uppercase tracking-widest text-gold-700 dark:text-gold-400">{pkg.package_category?.name}</div>
      <h2 className="text-xl font-bold leading-tight">{pkg.name}</h2>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-2xl font-bold">{formattedCurrency(pkg.price_final)}</span>
        {pkg.discount > 0 && (
          <>
            <span className="text-sm text-neutral-400 line-through dark:text-neutral-500">{formattedCurrency(pkg.price)}</span>
            <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-700 dark:text-gold-400">Hemat {pkg.discount}%</span>
          </>
        )}
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold">Yang Anda dapatkan</h3>
      <ul className="space-y-2 text-sm">
        {points.map((t, i) => (
          <li key={i} className="flex items-start gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-gold-600 dark:text-gold-400" /><span className="min-w-0 break-words">{t}</span></li>
        ))}
        {points.length === 0 && <li className="text-neutral-500 dark:text-neutral-400">Belum ada rincian untuk paket ini.</li>}
      </ul>

      <div className="mt-6 space-y-2">{children}</div>
    </BottomSheet>
  );
}
