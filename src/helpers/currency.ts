export function formattedCurrency(value: number) {
  return value
    .toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
    .replace(/\u00A0/, "");
}
