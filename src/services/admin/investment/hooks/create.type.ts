import { db } from "@constants/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { ICreateUpdateInvestmentPayload } from "../interfaces/create-update.types";

export default function useCreateInvestment() {
  const nameDB = "investment";
  const docRef = collection(db, nameDB);
  const queryClient = useQueryClient();

  const createInvestment = async (payload: ICreateUpdateInvestmentPayload) => {
    const { title, description, whatsapp, investments } = payload;

    try {
      const res = await addDoc(docRef, {
        title,
        description,
        whatsapp,
        investments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      queryClient.invalidateQueries([nameDB] as any);
      return { response: res, error: null };
    } catch (error: any) {
      if (error.status >= 500) {
        return { response: null, error: "Server error" };
      }

      return { response: null, error: error.data.message };
    }
  };

  return { createInvestment };
}
