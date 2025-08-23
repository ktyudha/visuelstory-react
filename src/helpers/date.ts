import dayjs from "dayjs";
import "dayjs/locale/id";

export function formattedDateTime(date: Date) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function formattedDate(date: Date) {
  return dayjs(date).format("DD-MM-YYYY");
}

export function formatDateCustom(date: Date) {
  return dayjs(date).format("dddd, D MMMM YYYY HH:mm");
}

export function formatDateRangeCustom(
  start: Date | string,
  end: Date | string
): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const sameMonth = startDate.month() === endDate.month();
  const sameYear = startDate.year() === endDate.year();

  if (sameMonth && sameYear) {
    return `${startDate.date()} - ${endDate.date()} ${endDate.format(
      "MMM"
    )} ${endDate.year()}`;
  }

  if (sameYear) {
    return `${startDate.date()} ${startDate.format(
      "MMM"
    )} - ${endDate.date()} ${endDate.format("MMM")} ${endDate.year()}`;
  }

  return `${startDate.date()} ${startDate.format(
    "MMM YYYY"
  )} - ${endDate.date()} ${endDate.format("MMM YYYY")}`;
}
