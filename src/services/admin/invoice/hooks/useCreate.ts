import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePayload } from "../interfaces/create.type";

export default function useCreate() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const createData = async (payload: ICreatePayload) => {
    const formData = new FormData();
    formData.append("customer_id", payload.customer_id);
    formData.append("proof", payload.proof); // File
    formData.append("packages", JSON.stringify(payload.packages));

    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).post("/admin/invoices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        revalidateMutationsByKey(/^\/admin\/invoices/);
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
