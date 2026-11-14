import { mutate } from "swr";
import axiosInstance from "@lib/axios-instance";
import type { Payment, TransactionStatus } from "../interfaces/get-all.type";

export interface PaymentResult {
  amount_paid: number;
  remaining_paid: number;
  transaction_status: TransactionStatus;
  payments: Payment[];
}

const http = () => axiosInstance({ withToken: true, tokenType: "admin" });

const refresh = (invoiceId: string) => {
  mutate(`/admin/invoices/${invoiceId}`);
  mutate((key) => typeof key === "string" && key.startsWith("/admin/invoices?"));
  mutate("/admin/dashboard");
};

export async function addPayment(
  invoiceId: string,
  body: { amount: number; paid_at?: string; method: string; note?: string }
) {
  const { data } = await http().post(`/admin/invoices/${invoiceId}/payments`, body);
  refresh(invoiceId);
  return data.data as PaymentResult;
}

export async function removePayment(invoiceId: string, paymentId: string) {
  const { data } = await http().delete(`/admin/invoices/${invoiceId}/payments/${paymentId}`);
  refresh(invoiceId);
  return data.data as PaymentResult;
}
