import { useEffect, useState } from 'react';
import { ActionIcon, Button, Flex, Title } from '@mantine/core';
import {
  IconAlertTriangle,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileZip,
} from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import useWebSocket from 'react-use-websocket';

import { Supplier } from '../types';
import { API_ENDPOINTS } from '../config';
import { useAppContext } from '../contextAPI/AppContext';
import { useDownloadReport } from '../hooks/useDownloadReport';
import { DataGrid } from './DataGrid';

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

  if (status === 'NOT_STARTED' || status === 'STARTED') {
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
        disabled={isFetching && shouldDownload?.fileType === 'pdf'}
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
  const session_status = status || sessionStatus;

  const { lastMessage: sessionLastMessage } = useWebSocket(
    `${API_ENDPOINTS.STREAMING_SESSION_STATUS(sessionId)}`,
    {
      shouldReconnect: () => true, // Auto-reconnect on close
    }
  );

  const { lastMessage } = useWebSocket(
    `${API_ENDPOINTS.STREAMING_ENSID_STATUS(sessionId)}`,
    {
      shouldReconnect: () => true, // Auto-reconnect on close
    }
  );

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
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      setRecords((prevRecords) => {
        const recordIndex = prevRecords.findIndex(
          (record) => record.ens_id === data.ens_id
        );

        if (recordIndex !== -1) {
          const updatedRecords = [...prevRecords];
          updatedRecords[recordIndex] = {
            ...updatedRecords[recordIndex],
            overall_status: data.overall_status,
          };
          return updatedRecords;
        }
        return prevRecords;
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    if (sessionLastMessage) {
      const data = JSON.parse(sessionLastMessage.data);
      if (data.session_id === sessionId) {
        setStatus(data.overall_status);
      }
    }
  }, [sessionLastMessage]);

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
      render: ({ ens_id, name, overall_status }) => (
        <DownloadButton
          sessionId={sessionId}
          ensId={ens_id}
          name={name}
          status={overall_status}
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
