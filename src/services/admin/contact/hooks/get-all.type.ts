import { db } from "@constants/firebase";
import { collection, getDocs } from "firebase/firestore";
import { IGetAllContactResponse } from "../interfaces/get-all.types";
import { useQuery } from "@tanstack/react-query";

export default function useGetAllAbout() {
  const nameDB = "contact";

  const fetcher = async (): Promise<IGetAllContactResponse[]> => {
    const docRef = collection(db, nameDB);
    const docSnap = await getDocs(docRef);

    return docSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<IGetAllContactResponse, "id">),
    }));
  };

  return useQuery({
    queryKey: [nameDB],
    queryFn: fetcher,
  });
}
