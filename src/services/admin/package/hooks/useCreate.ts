import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePayload } from "../interfaces/create.type";

export default function useCreate() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const createData = async (payload: ICreatePayload) => {
    const { package_category_id, name, description, price, discount } = payload;

    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).post("/admin/packages", {
        package_category_id,
        name,
        description,
        price,
        discount,
      });

      if (res.status === 200) {
        revalidateMutationsByKey(/^\/admin\/packages/);
      }

      return { response: res, error: null };
    } catch (error: any) {
      if (error.status >= 500) {
        return { response: null, error: "Server error" };
      }

      return { response: null, error: error.data.message };
    }
  };

  return { createData };
}
