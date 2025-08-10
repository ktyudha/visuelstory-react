import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";

export default function useDeletePackageCategory() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const deletePackageCategory = async (packageCategoryId: string) => {
    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).delete(`/admin/package-categories/${packageCategoryId}`);

      if (res.status === 200) {
        revalidateMutationsByKey(/^\/admin\/package-categories/);
      }

      return { response: res, error: null };
    } catch (error: any) {
      if (error.status >= 500) {
        return { response: null, error: "Server error" };
      }
      return { response: null, error: error.data.message };
    }
  };

  return { deletePackageCategory };
}
