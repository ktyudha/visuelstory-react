const widths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-1/3"];

/** Baris loading tabel: kerangka (skeleton) sebanyak `rows` baris dan `cols` kolom. */
export function LoadingRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-100 dark:border-gray-700" aria-hidden>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-6 py-4">
              <div className={`h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${widths[(r + c) % widths.length]}`} />
            </td>
          ))}
        </tr>
      ))}
      <tr className="sr-only"><td colSpan={cols} role="status">Memuat data...</td></tr>
    </>
  );
}

/** Baris kosong: satu sel selebar seluruh kolom. */
export function EmptyRow({ cols, text = "Belum ada data." }: { cols: number; text?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">{text}</td>
    </tr>
  );
}
