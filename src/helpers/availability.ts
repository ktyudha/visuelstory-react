export interface BookingConfig {
  slot_hours: number;
  max_parallel: number;
  open_hour: number;
  close_hour: number;
  step_minutes: number;
  lead_hours: number;
}

/** "YYYY-MM-DD HH:mm:ss" atau "YYYY-MM-DDTHH:mm" -> Date (waktu lokal, tanpa konversi zona). */
export const parseLocal = (s: string) => new Date(s.replace(" ", "T").slice(0, 16));

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Jam mulai yang ditawarkan, mis. ["07:00", "08:00", ...] */
export function slotTimes(cfg: BookingConfig): string[] {
  const out: string[] = [];
  for (let m = cfg.open_hour * 60; m <= cfg.close_hour * 60; m += cfg.step_minutes) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}

export type SlotState = "free" | "busy" | "past";

/** Satu acara memblokir [mulai, mulai + slot_hours). Bentrok bila jendelanya beririsan. */
export function slotState(start: Date, cfg: BookingConfig, busy: Date[], now: Date): SlotState {
  if (start.getTime() < now.getTime() + cfg.lead_hours * 3600e3) return "past";
  const span = cfg.slot_hours * 3600e3;
  const overlapping = busy.filter((b) => b.getTime() < start.getTime() + span && start.getTime() < b.getTime() + span).length;
  return overlapping >= cfg.max_parallel ? "busy" : "free";
}

export function daySlots(date: string, cfg: BookingConfig, busy: Date[], now: Date) {
  return slotTimes(cfg).map((time) => ({ time, state: slotState(parseLocal(`${date}T${time}`), cfg, busy, now) }));
}
