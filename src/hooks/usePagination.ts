import { useState } from 'react';

const PAGE_SIZES = [10, 20, 30, 40, 50];

export const usePagination = (initialPage: number = 1) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const resetPage = () => setPage(1);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    PAGE_SIZES,
  };
};
