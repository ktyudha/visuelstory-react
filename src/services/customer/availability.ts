import useSWR from "swr";
import axiosInstance from "@lib/axios-instance";
import type { BookingConfig } from "@helpers/availability";

export interface Availability {
  config: BookingConfig;
  busy: string[];
  now: string;
}

/** Jam yang sudah terisi pada rentang tanggal (publik, tanpa data pribadi). */
export function useAvailability(from: string, to: string, enabled = true) {
  const { data, isLoading, error } = useSWR<Availability>(
    enabled ? ["availability", from, to] : null,
    () => axiosInstance({ withToken: false }).get("/customer/availability", { params: { from, to } }).then((r) => r.data.data),
    { keepPreviousData: true, revalidateOnFocus: true, dedupingInterval: 15000 }
  );
  return { availability: data, loading: isLoading, error };
}
