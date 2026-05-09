import { Button } from "flowbite-react";

import useGetAllPackageCategory from "@services/admin/package-category/hooks/useGetAllPackageCategory";
import Skeleton from "@components/Skeleton/Skeleton";
import clsx from "clsx";

interface Props {
  category: string;
  setCategoryCallback: (param: string) => void;
}

export default function PackageAddOnCreateHeader({
  category,
  setCategoryCallback,
}: Props) {
  const { data, loading } = useGetAllPackageCategory();

  const totalPackages = data?.reduce(
    (total, item) => total + item.packages.length,
    0
  );

  return (
    <div className="flex mb-6 gap-4 overflow-auto">
      <Button
        onClick={() => setCategoryCallback("")}
        className={clsx(
          "cursor-pointer whitespace-nowrap text-xs",
          "bg-white dark:bg-black text-black dark:text-white",
          "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
          "!shadow-none !ring-0 !ring-offset-0",
          category == "" && "bg-black text-white dark:bg-white dark:text-black"
        )}
      >
        All
        <Skeleton isLoading={loading} className="!ml-2 !py-1 !rounded justify-end !my-auto !w-8 !h-6" >
          <span className="ml-2 px-2 text-xs py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            {totalPackages ?? 0}
          </span>
        </Skeleton>
      </Button>


      {loading || !data ? (
        Array.from({ length: 5 }).map((_, idx) =>
          <div
            key={`package-item-${idx}`}
            className="w-full flex border rounded-lg gap-2 px-4"
          >
            <Skeleton key={`package-item-${idx}`} isLoading={loading} className="h-4 my-auto" />
            <Skeleton key={`package-item-${idx}`} isLoading={loading} className="!py-1 !rounded !mt-1.5 justify-end !my-auto !w-10 !h-6" />
          </div>
        )
      ) : (
        data.map((item, idx) => {
          let isActive = category == item.id;
          return (
            <Button
              as="button"
              key={`header-package-category-${idx}`}
              onClick={() => setCategoryCallback(item.id)}
              className={clsx(
                "cursor-pointer whitespace-nowrap text-xs",
                "bg-white dark:bg-black text-black dark:text-white",
                "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
                "!shadow-none !ring-0 !ring-offset-0",
                isActive && "bg-black text-white dark:bg-white dark:text-black"
              )}
            >
              {item.name}

              <span className="ml-2 px-2 text-xs py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                {item.packages.length}
              </span>

            </Button>
          );
        })
      )}
    </div>
  );
}
