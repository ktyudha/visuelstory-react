/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "@/lib/axios-instance";
import useSWR, { type Fetcher } from "swr";
import { IGetAll } from "../interfaces/get-all.type";
import { useCallback, useState } from "react";
import querystring from "query-string";

export default function useGetAll() {
  const [name, setName] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const fetcher: Fetcher<IGetAll, string> = (url) =>
    axiosInstance({ withToken: true, tokenType: "admin" })
      .get(url)
      .then((res) => res.data);

  const qs = querystring.stringify(
    {
      name,
      page_limit: pageLimit,
      page: pageNum,
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data, error } = useSWR(`/admin/package-addons?${qs}`, fetcher);

  const onSetName = useCallback((name: string) => {
    setName(name);
  }, []);

  return {
    loading: !data && !error,
    data: data?.data,
    error,
    pagination: data?.pagination,
    pageNum,
    setPageNum,
    pageLimit,
    setPageLimit,
    name,
    setName: onSetName,
  };
}
