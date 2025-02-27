// import { useState, useEffect } from "react";
import { db } from "@constants/firebase";
import { doc, getDoc } from "firebase/firestore";
import { IGetOneAboutResponse } from "../interfaces/get-one.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useGetOneAbout(aboutId: string) {
  const nameDB = "about";
  const queryClient = useQueryClient();

  const fetcher = async (): Promise<IGetOneAboutResponse | null> => {
    if (!aboutId) return null;

    const docRef = doc(db, nameDB, aboutId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    queryClient.invalidateQueries([nameDB, aboutId] as any);
    const data = docSnap.data() as IGetOneAboutResponse;

    return {
      ...data,
      id: data.id || docSnap.id,
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [nameDB, aboutId],
    queryFn: fetcher,
    enabled: !!aboutId,
  });

  // const refreshData = () =>
  //   queryClient.invalidateQueries([nameDB, aboutId] as any);

  return { data, isLoading, error, refreshData: refetch };

  // const [data, setData] = useState<IGetOneAboutResponse | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!aboutId) return;

  //   const fetcher = async () => {
  //     setLoading(true);

  //     try {
  //       const docRef = doc(db, nameDB, aboutId);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         setData({
  //           id: docSnap.id,
  //           ...docSnap.data(),
  //         } as IGetOneAboutResponse);
  //       }
  //       queryClient.invalidateQueries([nameDB] as any);
  //     } catch (error: any) {
  //       if (error.status >= 500) {
  //         setError("Server Error");
  //       }

  //       setError(error.data.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetcher();
  // }, [aboutId]);

  // return { data, loading, error };
}
