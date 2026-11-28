/**
 * Design system "Receipt Photobooth": tegas (garis hitam tebal, bayangan keras) tapi lucu (maskot Nota).
 * Warna proyek: putih hangat, hitam, gold. Gold hanya untuk sorotan.
 */
import clsx from "clsx";

export const INK = "#171717";
export const PAPER = "#faf8f4";
export const GOLD = "#c9a24a";
export const GOLD_L = "#e3c777";
export const GOLD_P = "#f3e8c9";

export const ds = {
  /** Kartu: putih, garis tebal, bayangan keras */
  card: "rounded-3xl border-[3px] border-neutral-950 bg-white shadow-[5px_5px_0_#171717]",
  /** Tombol utama: gold, ditekan "amblas" */
  btn: "rounded-full border-[3px] border-neutral-950 bg-[#c9a24a] px-10 py-4 text-lg font-black text-neutral-950 shadow-[0_5px_0_#171717] transition active:translate-y-[4px] active:shadow-[0_1px_0_#171717] disabled:opacity-40",
  /** Tombol sekunder: putih */
  btn2: "rounded-full border-[3px] border-neutral-950 bg-white px-6 py-3 text-sm font-black text-neutral-950 shadow-[0_4px_0_#171717] transition active:translate-y-[3px] active:shadow-[0_1px_0_#171717] disabled:opacity-40",
  /** Tombol gelap: hitam + teks gold */
  btnDark: "rounded-full border-[3px] border-neutral-950 bg-neutral-950 px-6 py-3 text-sm font-black text-[#e3c777] shadow-[0_4px_0_#c9a24a] transition active:translate-y-[3px] active:shadow-[0_1px_0_#c9a24a] disabled:opacity-40",
  chip: (on: boolean) => clsx("rounded-full border-[3px] border-neutral-950 px-5 py-2.5 text-sm font-black transition active:scale-95", on ? "bg-neutral-950 text-[#e3c777]" : "bg-white text-neutral-950 shadow-[0_3px_0_#171717]"),
  /** Huruf judul: berat & tegas */
  display: "font-[Arial_Black,Helvetica_Neue,Helvetica,Arial,sans-serif] font-black uppercase tracking-tight",
};

export type Mood = "idle" | "happy" | "wow" | "wink";

/** Nota: maskot struk berwajah. Berkedip, melambai, dan berekspresi sesuai suasana. */
export function Mascot({ mood = "idle", className }: { mood?: Mood; className?: string }) {
  const teeth = Array.from({ length: 10 }, (_, i) => `L${105 - i * 10},130 L${100 - i * 10},120`).join(" ");
  const eye = (cx: number, wink = false) =>
    mood === "happy" || wink
      ? <path d={`M${cx - 7},60 Q${cx},50 ${cx + 7},60`} fill="none" stroke="#171717" strokeWidth="4.5" strokeLinecap="round" />
      : <g className="mb-blink"><ellipse cx={cx} cy="58" rx={mood === "wow" ? 8 : 6} ry={mood === "wow" ? 9 : 7} fill="#171717" /><circle cx={cx + 2} cy="55" r="2" fill="#fff" /></g>;
  return (
    <svg viewBox="-6 0 132 150" className={clsx("mb-bob overflow-visible", className)} aria-hidden>
      <path d="M-2,72 L-14,88" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
      <g className="mb-wave" style={{ transformOrigin: "110px 72px" }}><path d="M110,72 L126,54" stroke="#171717" strokeWidth="5" strokeLinecap="round" /><circle cx="127" cy="52" r="4.5" fill="#fff" stroke="#171717" strokeWidth="3" /></g>
      <path d={`M10,12 H110 V120 ${teeth} Z`} fill="#fff" stroke="#171717" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M10,12 H110 V34 H10 Z" fill="#c9a24a" stroke="#171717" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M22,23 H44 M52,23 H64" stroke="#171717" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      {eye(42)}{eye(78, mood === "wink")}
      <circle cx="31" cy="74" r="5.5" fill="#e3c777" /><circle cx="89" cy="74" r="5.5" fill="#e3c777" />
      {mood === "wow"
        ? <ellipse cx="60" cy="82" rx="6" ry="8" fill="#171717" />
        : mood === "happy" || mood === "wink"
          ? <g><path d="M46,76 Q60,100 74,76 Z" fill="#171717" stroke="#171717" strokeWidth="3" strokeLinejoin="round" /><path d="M54,88 Q60,94 66,88 Q60,84 54,88Z" fill="#e3c777" /></g>
          : <path d="M50,78 Q60,88 70,78" fill="none" stroke="#171717" strokeWidth="4.5" strokeLinecap="round" />}
      <g fill="#171717">{[24, 30, 34, 41, 46, 54, 58, 66, 72, 80, 85, 94].map((x, i) => <rect key={x} x={x} y="102" width={i % 3 === 0 ? 3.5 : 2} height="12" />)}</g>
    </svg>
  );
}
