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
      <div className="absolute inset-0 bg-black/55 duration-200 animate-in fade-in" onClick={onClose} />
      <div
        role="dialog" aria-modal="true" aria-label={label}
        style={{ transform: `translateY(${dy}px)`, transition: startY.current === null ? "transform .2s" : "none" }}
        onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
        onTouchMove={(e) => { if (startY.current !== null) setDy(Math.max(0, e.touches[0].clientY - startY.current)); }}
        onTouchEnd={() => { const far = dy > 90; startY.current = null; setDy(0); if (far) onClose(); }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88vh] max-w-md flex-col rounded-t-3xl bg-white pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 text-neutral-900 shadow-2xl duration-300 animate-in slide-in-from-bottom dark:bg-neutral-900 dark:text-neutral-100"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700" aria-hidden />
        <div className="min-h-0 flex-1 overflow-y-auto px-6">{children}</div>
      </div>
    </div>
  );
}
