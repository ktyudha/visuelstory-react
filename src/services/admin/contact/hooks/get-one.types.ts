// import { useState, useEffect } from "react";
import { db } from "@constants/firebase";
import { doc, getDoc } from "firebase/firestore";
import { IGetOneContactResponse } from "../interfaces/get-one.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useGetOneContact(contactId: string) {
  const nameDB = "contact";
  const queryClient = useQueryClient();

  const fetcher = async (): Promise<IGetOneContactResponse | null> => {
    if (!contactId) return null;

    const docRef = doc(db, nameDB, contactId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    queryClient.invalidateQueries([nameDB, contactId] as any);
    const data = docSnap.data() as IGetOneContactResponse;

    return {
      ...data,
      id: data.id || docSnap.id,
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [nameDB, contactId],
    queryFn: fetcher,
    enabled: !!contactId,
  });

  return { data, isLoading, error, refetch };
}
