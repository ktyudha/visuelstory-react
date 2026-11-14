import useSWR from "swr";
import axiosInstance from "@lib/axios-instance";

/** Ambil satu data admin untuk modal ubah (null = mode tambah). */
export function useAdminItem<T>(path: string, id: string | null) {
  const { data, isLoading } = useSWR<T>(id ? `${path}/${id}` : null, (u: string) =>
    axiosInstance({ withToken: true, tokenType: "admin" }).get(u).then((r) => r.data.data)
  );
  return { item: data, loading: !!id && isLoading };
}
