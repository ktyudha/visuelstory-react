import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import "flatpickr/dist/flatpickr.min.css";

interface Props {
  /** Format "YYYY-MM-DDTHH:mm" (sama dengan <input type="datetime-local">), "" jika kosong */
  value: string;
  onChange: (value: string) => void;
  /** Batas paling awal, format sama dengan value */
  min?: string;
  className?: string;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}

/** Layar sentuh -> picker native OS (roda iOS / dialog Android). Desktop -> kalender flatpickr + jam. */
const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function DateTimeInput({ value, onChange, min, className = "", placeholder = "Pilih tanggal & jam", id, ariaLabel }: Props) {
  const native = useRef(isTouch()).current;
  const ref = useRef<HTMLInputElement>(null);
  const fp = useRef<Instance | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (native || !ref.current) return;
    ref.current.placeholder = placeholder;
    fp.current = flatpickr(ref.current, {
      enableTime: true,
      time_24hr: true,
      minuteIncrement: 15,
      locale: Indonesian,
      dateFormat: "Y-m-d\\TH:i",
      altInput: true,
      altFormat: "D, j M Y • H:i",
      altInputClass: className,
      minDate: min,
      defaultDate: value || undefined,
      disableMobile: true,
      onChange: (_dates, str) => cb.current(str),
    });
    fp.current.altInput?.setAttribute("aria-label", ariaLabel ?? placeholder);
    return () => { fp.current?.destroy(); fp.current = null; };
    // inisialisasi sekali; perubahan value/min disinkronkan di efek bawah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fp.current) return;
    const current = fp.current.input.value;
    if ((value || "") !== current) fp.current.setDate(value || "", false);
  }, [value]);

  useEffect(() => { fp.current?.set("minDate", min); }, [min]);

  if (native) {
    return <input id={id} type="datetime-local" min={min} value={value} onChange={(e) => onChange(e.target.value)} className={className} aria-label={ariaLabel} />;
  }
  return <input id={id} ref={ref} type="text" readOnly className={className} />;
}
