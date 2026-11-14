import { isAxiosError } from "axios";
import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePayload } from "../interfaces/create.type";
import { jsonToFormData, JSONValue } from "@helpers/json-to-form-data";

export default function useCreate() {
  const revalidateMutationsByKey = useRevalidateMutation();

  const createData = async (payload: ICreatePayload) => {
    try {
      const res = await axiosInstance({
        withToken: true,
        tokenType: "admin",
      }).post(
        "/admin/invoices",
        jsonToFormData(payload as unknown as { [key: string]: JSONValue }),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status >= 200 && res.status < 300) {
        revalidateMutationsByKey(/^\/admin\/invoices/);
      }

      return { response: res, error: null };
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (!status || status >= 500) {
        return { response: null, error: "Server error" };
      }

      return {
        response: null,
        error: (isAxiosError(error) && error.response?.data?.message) || "Data tidak valid",
      };
    }
  };

  return { createData };
}
