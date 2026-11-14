import { useState } from "react";
import BottomSheet from "@components/BottomSheet";
import { btnDangerSolid, btnGhost, btnPrimary } from "@modules/customer/shared/ui";

interface Props {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/** Konfirmasi aksi penting lewat bottom sheet (dipasang bersyarat: {open && <ConfirmSheet ... />}). */
export default function ConfirmSheet({ title, message, confirmLabel = "Ya", cancelLabel = "Batal", danger, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };

  return (
    <BottomSheet label={title} onClose={busy ? () => {} : onClose}>
      <div className="pb-1 text-center">
        <h2 className="text-lg font-bold">{title}</h2>
        {message && <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>}
        <div className="mt-5 grid gap-2.5">
          <button onClick={confirm} disabled={busy} className={`${danger ? btnDangerSolid : btnPrimary} w-full`}>
            {busy ? "Memproses..." : confirmLabel}
          </button>
          <button onClick={onClose} disabled={busy} className={`${btnGhost} w-full`}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
