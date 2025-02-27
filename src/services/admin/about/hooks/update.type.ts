import { db } from "@constants/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ICreateUpdateAboutPayload } from "../interfaces/create-update-about.types";
import { useQueryClient } from "@tanstack/react-query";

export default function useUpdateAbout() {
  const nameDB = "about";
  const queryClient = useQueryClient();

  const updateAbout = async (
    aboutId: string,
    payload: ICreateUpdateAboutPayload
  ) => {
    try {
      const docRef = doc(db, nameDB, aboutId);

      await updateDoc(docRef, {
        title: payload.title,
        description: payload.description,
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

  return { updateAbout };
}
