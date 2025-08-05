import { useState } from "react";

export default function usePagination(maxPageNum: number) {
  const [pageNum, setPageNum] = useState(1);

  const goNextPage = () => {
    if (pageNum < maxPageNum) setPageNum((prevState) => prevState + 1);
  };

  const goPrevPage = () => {
    if (pageNum > 1) setPageNum((prevState) => prevState - 1);
  };

  const goPageNum = (param: number) => {
    setPageNum(param);
  };

  const resetPage = () => {
    setPageNum(1);
  };

  return {
    currentPage: pageNum,
    setPageNum,
    goNextPage,
    goPrevPage,
    resetPage,
    goPageNum,
  };
}
