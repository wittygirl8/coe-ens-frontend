import { useEffect, useState } from 'react';
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import {
  IconAlertTriangle,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileZip,
} from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { io } from 'socket.io-client';

import { Supplier } from '../types';
import { API_ENDPOINTS, ORBIS_URL } from '../config';
import { useAppContext } from '../contextAPI/AppContext';
import { useDownloadReport } from '../hooks/useDownloadReport';
import { DataGrid } from './DataGrid';

const socket = io(ORBIS_URL);

interface DownloadButtonProps {
  sessionId: string;
  ensId: string;
  name: string;
  status: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  sessionId,
  ensId,
  name,
  status,
}) => {
  const [shouldDownload, setShouldDownload] = useState<{
    fileType: 'pdf' | 'docx';
  } | null>(null);

  const { refetch, isFetching } = useDownloadReport({
    sessionId,
    ensId,
    fileType: shouldDownload?.fileType ?? 'pdf',
    type: 'single',
    fileName: name,
    enabled: !!shouldDownload,
  });

  useEffect(() => {
    if (shouldDownload) {
      refetch().finally(() => setShouldDownload(null));
    }
  }, [shouldDownload, refetch]);

  if (status === 'NOT_STARTED') {
    return (
      <ActionIcon
        loading
        variant="subtle"
        color="gray"
        title="Generating the document..."
      />
    );
  } else if (status === 'FAILED') {
    return (
      <ActionIcon variant="subtle" color="gray" title="Failed to Generate...">
        <IconAlertTriangle size={20} stroke={1.5} />
      </ActionIcon>
    );
  }

  return (
    <Flex align="center" justify="center" gap={4}>
      <ActionIcon
        onClick={() => setShouldDownload({ fileType: 'pdf' })}
        variant="subtle"
        color="gray"
        title="Download PDF"
        disabled
        // disabled={isFetching && shouldDownload?.fileType === 'pdf'}
      >
        <IconFileTypePdf size={20} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        onClick={() => setShouldDownload({ fileType: 'docx' })}
        variant="subtle"
        color="gray"
        title="Download DOCX"
        disabled={isFetching && shouldDownload?.fileType === 'docx'}
      >
        <IconFileTypeDocx size={20} stroke={1.5} />
      </ActionIcon>
    </Flex>
  );
};

export default function Results({
  sessionId: session_id = '',
  sessionStatus = 'NOT_STARTED',
}: Readonly<{
  sessionId?: string;
  sessionStatus?: 'COMPLETED' | 'FAILED' | 'IN-PROGRESS' | 'NOT_STARTED';
}>) {
  const [records, setRecords] = useState<Supplier[]>([]);
  const [downloadZip, setDownloadZip] = useState(false);
  const [status, setStatus] = useState('');

  const { sessionId: contextSessionId } = useAppContext();

  const sessionId = session_id || contextSessionId;
  const session_status = sessionStatus || status;

  const { refetch: refetchZip } = useDownloadReport({
    sessionId,
    type: 'bulk',
    fileType: 'zip',
    fileName: 'all-reports',
    enabled: downloadZip,
  });

  useEffect(() => {
    if (downloadZip) {
      refetchZip().finally(() => setDownloadZip(false));
    }
  }, [downloadZip, refetchZip]);

  useEffect(() => {
    socket.on('report-status', (data) => {
      setRecords((prevRecords) => {
        const recordIndex = prevRecords.findIndex(
          (record) => record.ens_id === data.ens_id
        );

        if (recordIndex !== -1) {
          const updatedRecords = [...prevRecords];
          updatedRecords[recordIndex] = {
            ...updatedRecords[recordIndex],
            report_generation_status: data.report_status,
          };
          return updatedRecords;
        }
        return prevRecords;
      });
    });

    socket.on('session-status', (data) => {
      if (data.session_id !== sessionId) return;
      setStatus(data.overall_status);
    });

    return () => {
      socket.off('report-status');
      socket.off('session-status');
    };
  }, [sessionId]);

  if (!sessionId) return null;

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
      render: ({ ens_id, name, report_generation_status }) => (
        <DownloadButton
          sessionId={sessionId}
          ensId={ens_id}
          name={name}
          status={report_generation_status}
        />
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Title order={3} fw={500} mb="md">
          Results
        </Title>
        <Button
          leftSection={
            session_status.toLowerCase() === 'failed' ? (
              <IconAlertTriangle size={18} stroke={1.5} />
            ) : (
              <IconFileZip size={18} stroke={1.5} />
            )
          }
          mb="sm"
          pr={12}
          variant="gradient"
          disabled={session_status.toLowerCase() !== 'completed'}
          onClick={() => setDownloadZip(true)}
        >
          {session_status.toLowerCase() === 'failed'
            ? 'Failed to Generate'
            : 'Download All as ZIP'}
        </Button>
      </Flex>
      <DataGrid
        records={records}
        setRecords={setRecords}
        fetchUrl={API_ENDPOINTS.GET_MAIN_SUPPLIER_DATA(sessionId)}
        columns={columns.map((column) => ({
          ...column,
          noWrap: true,
          ellipsis: undefined, // Ensure ellipsis is explicitly set to undefined
        }))}
        idAccessor="ens_id"
        height="60dvh"
        pinLastColumn
        staleTime={1}
      />
    </div>
  );
}
