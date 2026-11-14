/** Gaya komponen landing: minimalis, tombol persegi bergaris tipis. */
const base = "inline-flex items-center justify-center border px-9 py-4 text-[11px] uppercase tracking-[0.3em] transition-colors duration-300";

export const btnSolid = `${base} border-neutral-900 bg-neutral-900 text-white hover:bg-transparent hover:text-neutral-900`;
export const btnLine = `${base} border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white`;
export const btnSolidLight = `${base} border-white bg-white text-neutral-900 hover:bg-transparent hover:text-white`;
export const btnLineLight = `${base} border-white/60 text-white hover:bg-white hover:text-neutral-900`;
/** Tautan teks bergaris bawah. */
export const linkText = "border-b border-current pb-1 text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-60";
export const eyebrow = "text-[11px] uppercase tracking-[0.35em] text-neutral-500";
