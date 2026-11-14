import dayjs from "dayjs";
import "dayjs/locale/id";

/** Sisa waktu menuju tenggat, dalam bahasa manusia. `now` boleh waktu server agar tidak bergantung jam perangkat. */
export function timeLeft(deadline: string | null | undefined, now: dayjs.ConfigType = undefined) {
  if (!deadline) return null;
  const end = dayjs(deadline);
  const ms = end.diff(dayjs(now), "millisecond");
  const closed = ms <= 0;
  // Bulatkan ke atas ke jam penuh dulu, baru pecah jadi hari+jam (2 hari kurang 2 detik = "2 hari", bukan "1 hari").
  const totalHours = Math.ceil(Math.max(ms, 0) / 3600e3);
  const d = Math.floor(totalHours / 24);
  const h = totalHours % 24;

  const label = closed
    ? "Batas waktu berakhir"
    : d >= 3 ? `Sisa ${d} hari`
    : d >= 1 ? `Sisa ${d} hari${h ? ` ${h} jam` : ""}`
    : totalHours > 1 ? `Sisa ${totalHours} jam`
    : "Kurang dari 1 jam lagi";

  return {
    closed,
    label,
    /** "Jum, 21 Nov 2026 • 12:00" */
    date: end.locale("id").format("ddd, D MMM YYYY • HH:mm"),
    /** "Jum, 21 Nov • 12:00" (untuk ruang sempit) */
    short: end.locale("id").format("ddd, D MMM • HH:mm"),
    urgent: !closed && ms < 2 * 864e5,
  };
}
