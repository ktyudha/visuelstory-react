import { db } from "@constants/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { ICreateUpdateContactPayload } from "../interfaces/create-update.types";

export default function useCreateContact() {
  const nameDB = "contact";
  const docRef = collection(db, nameDB);
  const queryClient = useQueryClient();

  const createContact = async (payload: ICreateUpdateContactPayload) => {
    const { title, description, short_description } = payload;

    try {
      const res = await addDoc(docRef, {
        title,
        short_description,
        description,
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

  return { createContact };
}
