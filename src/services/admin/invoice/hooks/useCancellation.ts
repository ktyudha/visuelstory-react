import { mutate } from "swr";
import axiosInstance from "@lib/axios-instance";

const http = () => axiosInstance({ withToken: true, tokenType: "admin" });

/** Setujui / tolak pengajuan pembatalan dari customer. */
export async function reviewCancellation(invoiceId: string, action: "approve" | "reject", note?: string) {
  await http().post(`/admin/invoices/${invoiceId}/cancel/${action}`, { note: note || undefined });
  mutate(`/admin/invoices/${invoiceId}`);
  mutate((key) => typeof key === "string" && key.startsWith("/admin/invoices?"));
  mutate("/admin/dashboard");
}
