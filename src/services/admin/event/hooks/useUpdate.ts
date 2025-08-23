// import axiosInstance from "@/lib/axios-instance";
// import useRevalidateMutation from "@/lib/swr/useRevalidateMutation";
// import { ICreatePayload } from "../interfaces/create.type";

// export default function useUpdate(packageAddOnId: string) {
//   const revalidateMutationsByKey = useRevalidateMutation();

//   const updateData = async (payload: ICreatePayload) => {
//     const { name, price } = payload;
//     try {
//       const res = await axiosInstance({
//         withToken: true,
//         tokenType: "admin",
//       }).post(`/admin/package-addons/${packageAddOnId}`, {
//         name,
//         price,
//         _method: "PUT",
//       });

//       if (res.status === 200) {
//         revalidateMutationsByKey(/^\/admin\/package-addons/);
//       }

//       return { response: res, error: null };
//     } catch (error: any) {
//       if (error.status >= 500) {
//         return { response: null, error: "Server error" };
//       }

//       return { response: null, error: error.data.message };
//     }
//   };

//   return { updateData };
// }
