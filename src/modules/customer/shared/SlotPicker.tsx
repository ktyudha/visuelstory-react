import { useEffect, useMemo, useRef, useState } from "react";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import "flatpickr/dist/flatpickr.min.css";
import { CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import BottomSheet from "@components/BottomSheet";
import { daySlots, parseLocal, ymd } from "@helpers/availability";
import { useAvailability } from "@services/customer/availability";
import { btnPrimary } from "./ui";

interface Props {
  /** "YYYY-MM-DDTHH:mm" atau "" */
  value: string;
  onChange: (value: string) => void;
  /** Jadwal paket lain dalam pesanan yang sama (ikut memakai kapasitas) */
  others?: string[];
  className?: string;
  invalid?: boolean;
}

/** Pemilih jadwal: kalender (hari penuh dicoret) + jam kosong. Jam yang terisi tidak bisa dipilih. */
export default function SlotPicker({ value, onChange, others = [], className = "", invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(value.slice(0, 10));
  const [time, setTime] = useState(value.slice(11, 16));
  const [view, setView] = useState(() => dayjs(value || undefined).startOf("month"));

  const from = view.format("YYYY-MM-DD");
  const to = view.add(1, "month").endOf("month").format("YYYY-MM-DD");
  const { availability, loading } = useAvailability(from, to, open);

  const host = useRef<HTMLInputElement>(null);
  const fp = useRef<Instance | null>(null);

  const busyDates = useMemo(
    () => [...(availability?.busy ?? []), ...others.map((o) => o.replace("T", " "))].map(parseLocal),
    [availability, others]
  );
  const now = useMemo(() => new Date(), [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hari penuh = tidak ada jam kosong sama sekali
  const dayFull = useRef<(d: Date) => boolean>(() => false);
  dayFull.current = (d) => {
    if (!availability) return false;
    return daySlots(ymd(d), availability.config, busyDates, now).every((s) => s.state !== "free");
  };

  useEffect(() => {
    if (!open || !host.current) return;
    fp.current = flatpickr(host.current, {
      inline: true,
      locale: Indonesian,
      dateFormat: "Y-m-d",
      minDate: "today",
      defaultDate: date || undefined,
      disable: [(d: Date) => dayFull.current(d)],
      onChange: (_d, str) => { setDate(str); setTime(""); },
      onMonthChange: (_d, _s, inst) => setView(dayjs(new Date(inst.currentYear, inst.currentMonth, 1))),
      onYearChange: (_d, _s, inst) => setView(dayjs(new Date(inst.currentYear, inst.currentMonth, 1))),
    });
    return () => { fp.current?.destroy(); fp.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Setelah data ketersediaan tiba, gambar ulang agar hari penuh tercoret
  useEffect(() => { fp.current?.redraw(); }, [availability, busyDates]);

  const slots = useMemo(
    () => (date && availability ? daySlots(date, availability.config, busyDates, now) : []),
    [date, availability, busyDates, now]
  );
  const freeCount = slots.filter((s) => s.state === "free").length;
  const cfg = availability?.config;

  const close = () => setOpen(false);
  const confirm = () => { if (date && time) { onChange(`${date}T${time}`); close(); } };

  const label = value ? dayjs(value).locale("id").format("dddd, D MMM YYYY • HH:mm") : "Pilih tanggal & jam";

  return (
    <>
      <button
        type="button"
        onClick={() => { setDate(value.slice(0, 10)); setTime(value.slice(11, 16)); setView(dayjs(value || undefined).startOf("month")); setOpen(true); }}
        className={clsx("flex w-full cursor-pointer items-center justify-between gap-2 text-left", className, !value && "text-neutral-400 dark:text-neutral-500", invalid && "!border-red-500")}
        aria-haspopup="dialog"
      >
        <span className="flex min-w-0 items-center gap-2"><CalendarDays className="size-4 shrink-0 text-neutral-400" /><span className="truncate">{label}</span></span>
        <ChevronRight className="size-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <BottomSheet label="Pilih tanggal dan jam acara" onClose={close}>
          <h2 className="text-lg font-bold">Pilih tanggal &amp; jam</h2>
          <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
            Tanggal yang dicoret sudah penuh. {cfg ? `Satu sesi memakai waktu sekitar ${cfg.slot_hours} jam.` : ""}
          </p>

          <div className="slot-cal relative flex justify-center">
            <input ref={host} type="text" tabIndex={-1} aria-hidden style={{ display: "none" }} />
            {loading && !availability && (
              <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/70 dark:bg-neutral-900/70"><Loader2 className="size-5 animate-spin" /></div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{date ? dayjs(date).locale("id").format("dddd, D MMMM") : "Jam mulai"}</h3>
              {date && availability && <span className="text-xs text-neutral-500 dark:text-neutral-400">{freeCount} jam tersedia</span>}
            </div>

            {!date && <p className="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">Pilih tanggal dulu untuk melihat jam yang tersedia.</p>}
            {date && !availability && <p className="py-4 text-center text-sm text-neutral-500">Memuat jam tersedia...</p>}
            {date && availability && (
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Jam mulai">
                {slots.map(({ time: t, state }) => {
                  const on = time === t;
                  return (
                    <button
                      key={t} type="button" role="radio" aria-checked={on} disabled={state !== "free"}
                      onClick={() => setTime(t)}
                      className={clsx("h-11 rounded-xl border text-sm font-medium transition",
                        on ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : state === "free" ? "cursor-pointer border-neutral-300 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-white"
                          : "cursor-not-allowed border-transparent bg-neutral-100 text-neutral-400 line-through dark:bg-neutral-800 dark:text-neutral-600")}
                    >{t}</button>
                  );
                })}
              </div>
            )}
            {date && availability && freeCount === 0 && <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">Semua jam pada tanggal ini sudah terisi. Pilih tanggal lain.</p>}
            {date && availability && (
              <div className="mt-3 flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded border border-neutral-400" /> Tersedia</span>
                <span className="inline-flex items-center gap-1.5"><i className="size-3 rounded bg-neutral-200 dark:bg-neutral-700" /> Terisi</span>
              </div>
            )}
          </div>

          <button onClick={confirm} disabled={!date || !time} className={`${btnPrimary} mt-5 w-full`}>
            {date && time ? `Pilih ${dayjs(`${date}T${time}`).locale("id").format("D MMM, HH:mm")}` : "Pilih jam dulu"}
          </button>
        </BottomSheet>
      )}
    </>
  );
}
