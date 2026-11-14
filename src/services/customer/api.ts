import useSWR from "swr";
import { isAxiosError } from "axios";
import axiosInstance from "@lib/axios-instance";
import type {
  BookingPayload,
  Catalog,
  Order,
} from "./types";

const http = () => axiosInstance({ withToken: true, tokenType: "customer" });
const publicHttp = () => axiosInstance({ withToken: false });

export function getApiError(error: unknown, fallback = "Terjadi kesalahan. Coba lagi."): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    const fieldErrors = data?.data ?? data?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const first = Object.values(fieldErrors as Record<string, string[] | string>)[0];
      if (first) return Array.isArray(first) ? first[0] : String(first);
    }
    if (data?.message) return data.message;
    if (!error.response) return "Tidak dapat terhubung ke server.";
  }
  return fallback;
}

export function useCatalog() {
  const { data, error, isLoading, mutate } = useSWR<Catalog>(
    "/customer/catalog",
    (url: string) => publicHttp().get(url).then((r) => r.data.data),
    { revalidateOnFocus: false }
  );
  return { catalog: data, error, loading: isLoading, retry: mutate };
}

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    "/customer/invoices/history?limit=50",
    (url: string) => http().get(url).then((r) => r.data.data),
    { revalidateOnFocus: true }
  );
  return { orders: data, error, loading: isLoading, retry: mutate };
}

export function useOrder(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<Order>(
    id ? `/customer/invoices/${id}` : null,
    (url: string) => http().get(url).then((r) => r.data.data)
  );
  return { order: data, error, loading: isLoading, retry: mutate };
}

export const requestCancel = (id: string, reason: string) =>
  http().post(`/customer/invoices/${id}/cancel`, { reason }).then((r) => r.data.data as Order);

export const createBooking = (payload: BookingPayload) =>
  http().post("/customer/bookings", payload).then((r) => r.data.data as Order);
