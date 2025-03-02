// import { useState, useEffect } from "react";
import { db } from "@constants/firebase";
import { doc, getDoc } from "firebase/firestore";
import { IGetOneInvestmentResponse } from "../interfaces/get-one.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useGetOneContact(contactId: string) {
  const nameDB = "investment";
  const queryClient = useQueryClient();

  const fetcher = async (): Promise<IGetOneInvestmentResponse | null> => {
    if (!contactId) return null;

    const docRef = doc(db, nameDB, contactId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    queryClient.invalidateQueries([nameDB, contactId] as any);
    const data = docSnap.data() as IGetOneInvestmentResponse;

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
