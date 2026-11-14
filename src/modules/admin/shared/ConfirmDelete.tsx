import { useEffect } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Dialog konfirmasi hapus standar untuk semua modul admin. */
export default function ConfirmDelete({ open, title, description, busy, onConfirm, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={() => !busy && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl dark:bg-gray-800">
        <HiOutlineExclamationCircle className="mx-auto mb-3 text-red-500" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onClose} disabled={busy}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} autoFocus
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40">
            {busy ? "Menghapus..." : "Ya, hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
