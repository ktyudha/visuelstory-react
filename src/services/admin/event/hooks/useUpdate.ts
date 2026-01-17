import axiosInstance from "@/lib/axios-instance";
import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
import { ICreatePayload } from "../interfaces/create.type";

export default function useUpdate(eventId: string) {
    const revalidateMutationsByKey = useRevalidateMutation();

    const updateData = async (payload: ICreatePayload) => {
        const { package_id, invoice_id, date, note, location } = payload;
        try {
            const res = await axiosInstance({
                withToken: true,
                tokenType: "admin",
            }).post(`/admin/events/${eventId}`, {
                package_id, invoice_id, date, note, location,
                _method: "PUT",
            });

            if (res.status === 200) {
                revalidateMutationsByKey(/^\/admin\/events/);
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
