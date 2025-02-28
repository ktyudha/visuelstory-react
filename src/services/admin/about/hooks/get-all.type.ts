import { db } from "@constants/firebase";
import { collection, getDocs } from "firebase/firestore";
import { IGetAllAboutResponse } from "../interfaces/get-all.types";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllAbout() {
  const nameDB = "about";

  const fetcher = async (): Promise<IGetAllAboutResponse[]> => {
    const docRef = collection(db, nameDB);
    const docSnap = await getDocs(docRef);

    return docSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<IGetAllAboutResponse, "id">),
    }));
  };

  return useQuery({
    queryKey: [nameDB],
    queryFn: fetcher,
  });
}
