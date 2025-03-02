import { db } from "@constants/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ICreateUpdateInvestmentPayload } from "../interfaces/create-update.types";
import { useQueryClient } from "@tanstack/react-query";

export default function useUpdateContact() {
  const nameDB = "investment";
  const queryClient = useQueryClient();

  const updateContact = async (
    contactId: string,
    payload: ICreateUpdateInvestmentPayload
  ) => {
    const { title, description, whatsapp, investments } = payload;

    try {
      const docRef = doc(db, nameDB, contactId);

      await updateDoc(docRef, {
        title,
        description,
        whatsapp,
        investments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      queryClient.invalidateQueries([nameDB] as any);
      return { response: "Update Successful", error: null };
    } catch (error: any) {
      if (error.status >= 500) {
        return { response: null, error: "Server error" };
      }

      return { response: null, error: error.data.message };
    }
  };

  return { updateContact };
}
