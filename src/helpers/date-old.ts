import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";

export function formattedDate(date: string) {
  return format(new Date(date), "dd MMMM yyyy", { locale: id });
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatFormDate(date: Date): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatDateChart(date: string) {
  return formatInTimeZone(date, "UTC", "dd MMMM yyyy", { locale: id });
}

export const convertDateYMD = (dateStr: string) => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
};
