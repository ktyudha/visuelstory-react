import { db } from "@constants/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ICreateUpdateContactPayload } from "../interfaces/create-update.types";
import { useQueryClient } from "@tanstack/react-query";

export default function useUpdateContact() {
  const nameDB = "contact";
  const queryClient = useQueryClient();

  const updateContact = async (
    contactId: string,
    payload: ICreateUpdateContactPayload
  ) => {
    const { title, description, short_description } = payload;

    try {
      const docRef = doc(db, nameDB, contactId);

      await updateDoc(docRef, {
        title,
        short_description,
        description,
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
