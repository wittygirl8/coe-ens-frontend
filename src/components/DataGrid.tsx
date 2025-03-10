import { DataTable, DataTableProps } from 'mantine-datatable';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import axiosInstance from '../utils/axiosInstance';

const PAGE_SIZES = [10, 20, 30, 40, 50];

type DataGridProps<T> = DataTableProps<T> & {
  fetchUrl: string;
  setRecords: (records: T[]) => void;
};

export const DataGrid = <T,>({
  fetchUrl,
  setRecords,
  ...rest
}: DataGridProps<T>) => {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const { isFetching, data, isError, error } = useQuery({
    queryKey: ['dataGrid', fetchUrl, page, pageSize], // Unique cache key
    queryFn: async () => {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page=${page - 1}&limit=${pageSize}`;
      const { data } = await axiosInstance.get(url);
      setRecords(data?.data.data);
      return data;
    },
  });

  if (isError) {
    throw new Error(`Error fetching data: ${error.message}`);
  }

  return (
    <DataTable
      shadow='sm'
      minHeight={400}
      maxHeight={800}
      fetching={isFetching}
      withTableBorder
      totalRecords={data?.data.total_data}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={setPage}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={setPageSize}
      paginationText={({ from, to, totalRecords }) =>
        `Showing ${from} - ${to} of ${totalRecords} results`
      }
      {...rest}
    />
  );
};
