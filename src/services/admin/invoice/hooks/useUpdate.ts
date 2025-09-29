import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePayload } from "../interfaces/create.type";
import { jsonToFormData, JSONValue } from "@helpers/json-to-form-data";

export default function useUpdate(invoiceId: string) {
  const revalidateMutationsByKey = useRevalidateMutation();

  const updateData = async (payload: ICreatePayload) => {
    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).post(
        `/admin/invoices/${invoiceId}`,
        jsonToFormData({ ...payload, _method: "PUT" } as unknown as {
          [key: string]: JSONValue;
        }),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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

  return { updateData };
}
