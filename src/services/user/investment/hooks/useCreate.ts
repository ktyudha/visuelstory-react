import { db } from "@constants/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { ICreateInvestmentPayload } from "../interfaces/create.types";

export default function useCreateInvestment() {
  const nameDB = "users";
  const docRef = collection(db, nameDB);
  const queryClient = useQueryClient();

  const createInvestment = async (payload: ICreateInvestmentPayload) => {
    const { name, email, whatsapp, location } = payload;
    try {
      const res = await addDoc(docRef, {
        name,
        email,
        whatsapp,
        location,
        createdAt: serverTimestamp(),
      });

      queryClient.invalidateQueries([nameDB] as any);
      return { response: res, error: null };
    } catch (error: any) {
      if (error.status >= 500) {
        return { response: null, error: "server error!" };
      }

      return { response: null, error: error.data.message };
    }
  };

  return { createInvestment };
}
