import { DataTable, DataTableProps } from 'mantine-datatable';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import axiosInstance from '../utils/axiosInstance';
import { usePagination } from '../hooks/usePagination';

type DataGridProps<T> = DataTableProps<T> & {
  fetchUrl: string;
  setRecords: (records: T[]) => void;
  staleTime?: number;
};

export const DataGrid = <T,>({
  fetchUrl,
  setRecords,
  staleTime,
  ...rest
}: DataGridProps<T>) => {
  const { page, setPage, pageSize, setPageSize, PAGE_SIZES } = usePagination();

  const { isFetching, data, isError, error } = useQuery({
    queryKey: ['dataGrid', fetchUrl, page, pageSize],
    queryFn: async () => {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page_no=${page}&rows_per_page=${pageSize}`;
      const { data } = await axiosInstance.get(url);
      return data;
    },
    staleTime: staleTime ? 1000 * staleTime : Infinity,
  });

  useEffect(() => {
    if (data?.data.data) {
      setRecords(data?.data.data);
    }
  }, [data]);

  if (isError) {
    throw new Error(`Error fetching data: ${error.message}`);
  }

  return (
    <DataTable
      shadow="sm"
      minHeight={400}
      fetching={isFetching}
      withTableBorder
      totalRecords={data?.data.total_data}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={(page) => setPage(page)}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={(val) => {
        setPage(1);
        setPageSize(val);
      }}
      paginationText={({ from, to, totalRecords }) =>
        `Showing ${from} - ${to} of ${totalRecords} results`
      }
      {...rest}
    />
  );
};
