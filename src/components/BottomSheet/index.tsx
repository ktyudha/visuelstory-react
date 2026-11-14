import { useEffect, useRef, useState } from "react";

interface Props {
  onClose: () => void;
  label?: string;
  children: React.ReactNode;
}

/** Bottom sheet modal: latar redup, handle, bisa digeser ke bawah / ketuk latar / Esc untuk menutup. */
export default function BottomSheet({ onClose, label = "Dialog", children }: Props) {
  const [dy, setDy] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-[#000000]/40 duration-200 animate-in fade-in" onClick={onClose} />
      <div
        role="dialog" aria-modal="true" aria-label={label}
        style={{ transform: `translateY(${dy}px)`, transition: startY.current === null ? "transform .2s" : "none" }}
        className="glass-strong absolute inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] mx-auto flex max-h-[85vh] max-w-md flex-col rounded-[28px] pb-5 pt-3 text-neutral-900 duration-300 animate-in slide-in-from-bottom dark:text-neutral-100"
      >
        {/* Geser-untuk-tutup hanya dari area pegangan ini, agar scroll isi sheet tidak ikut menutupnya */}
        <div
          className="-mt-3 mb-1 shrink-0 cursor-grab touch-none py-3"
          onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
          onTouchMove={(e) => { if (startY.current !== null) setDy(Math.max(0, e.touches[0].clientY - startY.current)); }}
          onTouchEnd={() => { const far = dy > 90; startY.current = null; setDy(0); if (far) onClose(); }}
          onTouchCancel={() => { startY.current = null; setDy(0); }}
        >
          <div className="mx-auto h-[5px] w-9 rounded-full bg-neutral-300 dark:bg-neutral-600" aria-hidden />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">{children}</div>
      </div>
    </div>
  );
}
