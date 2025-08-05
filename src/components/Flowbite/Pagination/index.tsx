import { Pagination } from "flowbite-react";
import { useEffect, useState } from "react";

// export interface Props {
//   goNextPage: () => void;
//   goPrevPage: () => void;
//   setPageLimit?: (limit: number) => void;
//   setPageNum?: (limit: number) => void;
//   setCurrentPage?: (limit: number) => void;
//   perPage?: number;
//   total?: number;
//   pageLimit?: number;
//   currentPage?: number;
//   lastPage?: number | any;
// }

type Props = {
  maxPageNum: number;
  perPage?: number;
  pageLimit?: number;
  setPageNum: (page: number) => void;
  total?: number;
};

export default function PaginationComponent({
  setPageNum,
  maxPageNum,
  perPage = 10,
  pageLimit,
  total = 0,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const onPageChange = (page: number) => setCurrentPage(page);

  useEffect(() => {
    setPageNum(currentPage);
  }, [currentPage]);

  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center flex-column flex-wrap md:flex-row md:justify-between justify-center pt-4">
      <span className="text-center md:text-left text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {total}
        </span>
      </span>

      <Pagination
        currentPage={currentPage}
        totalPages={maxPageNum}
        onPageChange={onPageChange}
      />
    </div>
  );
}
