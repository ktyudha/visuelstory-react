import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";

export default function useDelete() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const deleteData = async (customerId: string) => {
    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).delete(`/admin/customers/${customerId}`);

      if (res.status === 200) {
        revalidateMutationsByKey(/^\/admin\/customers/);
      }

      return { response: res, error: null };
    } catch (error: any) {
      if ((error.response?.status ?? 500) >= 500) {
        return { response: null, error: "Server error" };
      }
      return { response: null, error: error.response?.data?.message ?? "Terjadi kesalahan" };
    }
  };

  return { deleteData };
}
