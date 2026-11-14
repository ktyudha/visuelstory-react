import { isAxiosError } from "axios";
import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";

export default function useDelete() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const deleteData = async (invoiceId: string) => {
    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).delete(`/admin/invoices/${invoiceId}`);

      if (res.status === 200) {
        revalidateMutationsByKey(/^\/admin\/invoices/);
      }

      return { response: res, error: null };
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (!status || status >= 500) {
        return { response: null, error: "Server error" };
      }
      return { response: null, error: "Gagal menghapus data" };
    }
  };

  return { deleteData };
}
