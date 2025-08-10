/* eslint-disable @typescript-eslint/no-unused-vars */
import axiosInstance from "@/lib/axios-instance";
import useSWR, { type Fetcher } from "swr";
import { IGetPackageCategory } from "../interfaces/get-all-package-category.type";

export default function useGetPackageCategory(packageCategoryId: string) {
  const fetcher: Fetcher<IGetPackageCategory, string> = (url) =>
    axiosInstance({ withToken: true, tokenType: "admin" })
      .get(url)
      .then((res) => res.data);

  const { data, error } = useSWR(
    `/admin/package-categories/${packageCategoryId}`,
    fetcher
  );

  return {
    loading: !data && !error,
    event: data?.data,
    error,
  };
}
