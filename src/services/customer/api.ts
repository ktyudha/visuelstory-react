import useSWR from "swr";
import { isAxiosError } from "axios";
import axiosInstance from "@lib/axios-instance";
import config from "@constants/config";
import Cookies from "js-cookie";
import type {
  BookingPayload,
  Catalog,
  EditedGallery,
  Gallery,
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

export function useGallery(id?: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Gallery>(
    id ? `/customer/invoices/${id}/photos` : null,
    (url: string) => http().get(url).then((r) => r.data.data),
    {
      revalidateOnMount: true, // selalu ambil yang terbaru saat halaman dibuka
      revalidateOnFocus: false,
      dedupingInterval: 0,
      shouldRetryOnError: false,
      refreshInterval: 150 * 60 * 1000, // perbarui link foto sebelum kedaluwarsa (3-4 jam)
    }
  );
  return { gallery: data, error, loading: isLoading, validating: isValidating, retry: mutate, mutate };
}

export function useEditedGallery(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<EditedGallery>(
    id ? `/customer/invoices/${id}/edited-photos` : null,
    (url: string) => http().get(url).then((r) => r.data.data),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { gallery: data, error, loading: isLoading, retry: mutate };
}

export const createBooking = (payload: BookingPayload) =>
  http().post("/customer/bookings", payload).then((r) => r.data.data as Order);

export const saveSelection = (id: string, fileIds: string[], note: string) =>
  http().put(`/customer/invoices/${id}/selection`, { file_ids: fileIds, note });

/** Simpan saat halaman ditutup: fetch keepalive tetap berjalan walau tab sudah hilang. */
export function saveSelectionKeepalive(id: string, fileIds: string[], note: string) {
  try {
    void fetch(`${config.BASE_API_URL}/customer/invoices/${id}/selection`, {
      method: "PUT",
      keepalive: true,
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${Cookies.get("token-customer") ?? ""}` },
      body: JSON.stringify({ file_ids: fileIds, note }),
    });
  } catch { /* abaikan */ }
}

export const submitSelection = (id: string) =>
  http().post(`/customer/invoices/${id}/selection/submit`);
