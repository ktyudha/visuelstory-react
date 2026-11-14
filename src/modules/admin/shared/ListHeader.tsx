import { useMemo, type ReactNode } from "react";
import { HiPlus, HiSearch } from "react-icons/hi";
import debounce from "lodash/debounce";

interface Props {
  onSearch?: (value: string) => void;
  placeholder?: string;
  createLabel?: string;
  /** Dipanggil saat tombol tambah ditekan (membuka modal). Tanpa ini tombol disembunyikan. */
  onCreate?: () => void;
  /** Kontrol filter tambahan (mis. pilih kategori), tampil di samping pencarian. */
  filters?: ReactNode;
}

/** Header daftar admin: pencarian + tombol buat (dipakai semua modul). */
export default function ListHeader({
  onSearch,
  placeholder = "Cari...",
  createLabel = "Tambah",
  onCreate,
  filters,
}: Props) {
  const debounced = useMemo(() => debounce((v: string) => onSearch?.(v), 400), [onSearch]);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-80">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={placeholder}
          onChange={(e) => debounced(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      {filters}
      </div>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <HiPlus /> {createLabel}
        </button>
      )}
    </div>
  );
}
