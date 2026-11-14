import { HiMinus, HiPlus } from "react-icons/hi";

export const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40";

export const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-900 dark:text-white">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function Stepper({ value, min = 0, max = 99, onChange }: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
      <button type="button" aria-label="Kurangi" disabled={value <= min} onClick={() => onChange(value - 1)} className="cursor-pointer p-2 disabled:opacity-30"><HiMinus /></button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="Tambah" disabled={value >= max} onClick={() => onChange(value + 1)} className="cursor-pointer p-2 disabled:opacity-30"><HiPlus /></button>
    </div>
  );
}
