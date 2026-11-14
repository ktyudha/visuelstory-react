import { useEffect } from "react";
import { HiX } from "react-icons/hi";
import { btnGhost, btnPrimary } from "./ui";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  valid?: boolean;
  submitLabel?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}

/** Modal form standar untuk tambah / ubah data. */
export default function FormModal({ open, title, onClose, onSubmit, submitting, valid = true, submitLabel = "Simpan", size = "md", children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !submitting && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, submitting, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={() => !submitting && onClose()}>
      <form
        role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-gray-800 sm:rounded-2xl ${size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><HiX size={20} /></button>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <button type="button" className={btnGhost} onClick={onClose} disabled={submitting}>Batal</button>
          <button type="submit" className={btnPrimary} disabled={!valid || submitting}>{submitting ? "Menyimpan..." : submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
