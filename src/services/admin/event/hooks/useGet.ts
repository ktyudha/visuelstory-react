/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "@/lib/axios-instance";
import useSWR, { type Fetcher } from "swr";
import { IGet } from "../interfaces/get-all.type";

export default function useGetEvent(eventId: string) {
  const fetcher: Fetcher<IGet, string> = (url) =>
    axiosInstance({ withToken: true, tokenType: "admin" })
      .get(url)
      .then((res) => res.data);

  const { data, error } = useSWR(
    `/admin/events/${eventId}`,
    fetcher
  );

  return {
    loading: !data && !error,
    data: data?.data,
    error,
  };
}
