import { useState, useEffect } from "react";
import { db } from "@constants/firebase";
import { doc, getDoc } from "firebase/firestore";
import { IGetOneAboutResponse } from "../interfaces/get-one.types";

export default function useGetOneAbout(aboutId: string) {
  const nameDB = "about";

  const [data, setData] = useState<IGetOneAboutResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!aboutId) return;

    const fetcher = async () => {
      setLoading(true);

      try {
        const docRef = doc(db, nameDB, aboutId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData({
            id: docSnap.id,
            ...docSnap.data(),
          } as IGetOneAboutResponse);
        }
      } catch (error: any) {
        if (error.status >= 500) {
          setError("Server Error");
        }

        setError(error.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, [aboutId]);

  return { data, loading, error };
}
