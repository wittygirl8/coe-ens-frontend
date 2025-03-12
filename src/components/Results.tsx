import { useState } from 'react';
import { DataGrid } from './DataGrid';
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import {
  IconAlertTriangle,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileZip,
} from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useQuery } from '@tanstack/react-query';

import { Supplier } from '../types';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';
import { useAppContext } from '../contextAPI/AppContext';

async function downloadReport(
  sessionId: string,
  ensId: string = '',
  fileType: 'pdf' | 'docx' | 'zip' = 'pdf',
  type: 'single' | 'bulk' = 'single',
  fileName: string = 'report',
) {
  const url =
    type === 'single'
      ? API_ENDPOINTS.SINGLE_REPORT_DOWNLOAD(sessionId, ensId, fileType)
      : API_ENDPOINTS.BULK_REPORT_DOWNLOAD(sessionId);

  try {
    const result = await axiosInstance.get(url, { responseType: 'blob' });
    const blob = result.data;

    // Create a downloadable link and trigger a click
    const fileUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${fileName}.${fileType}`; // Set the file name dynamically
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(fileUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading report:', error);
  }
}

interface DownloadButtonProps {
  sessionId: string;
  ensId: string;
  name: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  sessionId,
  ensId,
  name,
}) => {
  const { data, isError } = useQuery({
    queryKey: ['final-ensid-status', sessionId, ensId],
    queryFn: async ({ signal }) => {
      const { data } = await axiosInstance.get(
        API_ENDPOINTS.ENS_ID_STATUS(sessionId, ensId),
        { signal },
      );

      return data;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.data.overall_status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false;
      }

      return 15 * 1000; // 15 seconds
    },
  });

  if (isError) {
    throw new Error('Error fetching data');
  }

  const status = data?.data.overall_status;

  if (status === 'FAILED')
    return (
      <ActionIcon variant='subtle' color='gray' title='Failed to Generate...'>
        <IconAlertTriangle size={20} stroke={1.5} />
      </ActionIcon>
    );

  if (status !== 'COMPLETED')
    return (
      <ActionIcon
        loading
        variant='subtle'
        color='gray'
        title='Generating the document...'
      />
    );

  return (
    <Flex align='center' justify='center' gap={4}>
      <ActionIcon
        onClick={() => downloadReport(sessionId, ensId, 'pdf', 'single', name)}
        variant='subtle'
        color='gray'
        title='Download PDF'
      >
        <IconFileTypePdf size={20} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        onClick={() => downloadReport(sessionId, ensId, 'docx', 'single', name)}
        variant='subtle'
        color='gray'
        title='Download DOCX'
      >
        <IconFileTypeDocx size={20} stroke={1.5} />
      </ActionIcon>
    </Flex>
  );
};

export default function Results() {
  const [records, setRecords] = useState<Supplier[]>([]);
  const { sessionId } = useAppContext();

  const { data, isError } = useQuery({
    queryKey: ['final-session-status-zip-finale', sessionId],
    queryFn: async ({ signal }) => {
      const { data } = await axiosInstance.get(
        API_ENDPOINTS.SESSION_STATUS(sessionId),
        { signal },
      );

      return data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.data.overall_status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false;
      }

      return 15 * 1000; // 15 seconds
    },
  });

  const columns: Array<DataTableColumn<Supplier>> = [
    { accessor: 'name', title: 'Name' },
    { accessor: 'national_id', title: 'National ID' },
    { accessor: 'country', title: 'Country' },
    { accessor: 'address', title: 'Address' },
    { accessor: 'state', title: 'State' },
    { accessor: 'city', title: 'City' },
    { accessor: 'postcode', title: 'Postcode' },
    { accessor: 'phone_or_fax', title: 'Phone or Fax' },
    { accessor: 'email_or_website', title: 'Email or Website' },
    {
      accessor: 'download',
      title: 'Download',
      textAlign: 'center',
      render: ({ ens_id, name }) => (
        <DownloadButton sessionId={sessionId} ensId={ens_id} name={name} />
      ),
    },
  ];

  if (isError) {
    throw new Error('Error fetching data');
  }

  const status = data?.data.overall_status;

  return (
    <div>
      <Flex justify='space-between' align='center'>
        <Title order={3} fw={500} mb='md'>
          Results
        </Title>
        <Button
          leftSection={
            <>
              {status === 'Failed' ? (
                <IconAlertTriangle size={18} stroke={1.5} />
              ) : (
                <IconFileZip size={18} stroke={1.5} />
              )}
            </>
          }
          mb='sm'
          pr={12}
          variant='gradient'
          disabled={data?.data.overall_status !== 'COMPLETED'}
          onClick={() => {
            downloadReport(sessionId, '', 'zip', 'bulk', 'all-reports');
          }}
        >
          {status === 'Failed' ? 'Failed to Generate' : 'Download All as ZIP'}
        </Button>
      </Flex>
      <DataGrid
        records={records}
        setRecords={setRecords}
        fetchUrl={API_ENDPOINTS.GET_MAIN_SUPPLIER_DATA(sessionId)}
        columns={columns}
        idAccessor='ens_id'
        height='60dvh'
        pinLastColumn
      />
    </div>
  );
}
