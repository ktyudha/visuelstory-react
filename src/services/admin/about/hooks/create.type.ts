import { db } from "@constants/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { ICreateUpdateAboutPayload } from "../interfaces/create-update-about.types";

export default function useCreateAbout() {
  const nameDB = "about";
  const docRef = collection(db, nameDB);
  const queryClient = useQueryClient();

  const createAbout = async (payload: ICreateUpdateAboutPayload) => {
    // const { title, description, createdAt, updatedAt } = payload;

    try {
      const res = await addDoc(docRef, {
        title: payload.title,
        description: payload.description,
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

  return { createAbout };
}
