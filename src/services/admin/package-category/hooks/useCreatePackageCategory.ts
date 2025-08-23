import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePackageCategoryPayload } from "../interfaces/create-package-category.type";

export default function useCreatePackageCategory() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const createPackageCategory = async (
    payload: ICreatePackageCategoryPayload
  ) => {
    const { name, description } = payload;

    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).post("/admin/package-categories", {
        name,
        description,
      });

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

  return { createPackageCategory };
}
