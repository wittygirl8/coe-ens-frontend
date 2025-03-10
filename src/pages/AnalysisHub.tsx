import {
  Title,
  Transition,
  Burger,
  Flex,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';
import { useDisclosure } from '@mantine/hooks';

import MainDashboardLayout from '../layouts/MainDashboardLayout';
import Results from '../components/Results';
import { DataGrid } from '../components/DataGrid';
import { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';

type SessionInfo = {
  session_id: string;
  create_time: string;
  overall_status: 'COMPLETED' | 'IN-PROGRESS';
};

const SessionStatus = ({
  session_id,
  overall_status,
}: {
  session_id: string;
  overall_status: 'COMPLETED' | 'IN-PROGRESS';
}) => {
  const [isCompleted, setIsCompleted] = useState(
    overall_status === 'COMPLETED',
  );

  useQuery({
    queryKey: ['final-session-status', session_id],
    queryFn: async ({ signal }) => {
      const { data } = await axiosInstance.get(
        API_ENDPOINTS.SESSION_STATUS(session_id),
        { signal },
      );

      return data;
    },
    enabled: !session_id,
    refetchInterval: (query) => {
      if (query.state.data?.data.overall_status === 'COMPLETED') {
        setIsCompleted(true);
        return false;
      }

      return 15000; // 3 seconds
    },
  });

  return (
    <>
      {!isCompleted ? (
        <Badge
          color='orange'
          variant='subtle'
          leftSection={
            <ActionIcon
              variant='subtle'
              loading
              color='orange'
              size={'xs'}
            ></ActionIcon>
          }
        >
          In-progress
        </Badge>
      ) : (
        <Badge
          color='green'
          variant='subtle'
          leftSection={
            <ActionIcon variant='subtle' color='green' size={'xs'}>
              <IconCheck size={16} />
            </ActionIcon>
          }
        >
          Completed
        </Badge>
      )}
    </>
  );
};

const columns: Array<DataTableColumn<SessionInfo>> = [
  { accessor: 'session_id', title: 'Session ID' },
  {
    accessor: 'create_time',
    title: 'Created At',
    textAlign: 'center',
    render: ({ create_time }) =>
      new Date(create_time).toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
  },
  {
    accessor: 'status',
    title: <Flex justify={'center'}>Status</Flex>,
    textAlign: 'left',
    render: ({ overall_status, session_id }) => (
      <SessionStatus session_id={session_id} overall_status={overall_status} />
    ),
  },
];

function SessionTable({
  setSessionId,
}: Readonly<{ setSessionId: (sessionId: string) => void }>) {
  const [records, setRecords] = useState<SessionInfo[]>([]);
  const [selectedRow, setSelectedRow] = useState<SessionInfo | null>(null);

  const onRowClick = (args: { record: SessionInfo }) => {
    setSelectedRow(args.record);
    setSessionId(args.record.session_id);
  };

  const rowBackgroundColor = (record: SessionInfo) => {
    if (record.session_id === selectedRow?.session_id)
      return { dark: '#000', light: '#d3dce2' };
    else return { dark: '', light: '' };
  };

  useEffect(() => {
    if (!selectedRow) {
      setSessionId(records[0]?.session_id || '');
      setSelectedRow(records[0] || null);
    }
  }, [records, selectedRow]);

  return (
    <div>
      <DataGrid
        idAccessor='session_id'
        records={records}
        setRecords={setRecords}
        fetchUrl={API_ENDPOINTS.GET_SESSION_SCREENING_STATUS}
        columns={columns}
        onRowClick={onRowClick}
        rowBackgroundColor={rowBackgroundColor}
        striped={false}
        highlightOnHover={false}
        height='60dvh'
      />
    </div>
  );
}

export default function AnalysisHub() {
  const [opened, { toggle }] = useDisclosure(true);
  const [sessionId, setSessionId] = useState('');

  return (
    <MainDashboardLayout>
      <Burger opened={opened} onClick={toggle} size='sm' />

      <Flex justify='space-between' gap='md' style={{ overflow: 'hidden' }}>
        <Transition
          mounted={opened}
          transition='scale-x'
          duration={400}
          timingFunction='ease'
        >
          {(styles) => (
            <div
              style={{
                ...styles,
                flexShrink: 0, // Prevents scrollbar
                overflow: 'hidden',
              }}
            >
              <Title order={3} fw={500} mb='md'>
                Sessions Info
              </Title>
              <SessionTable setSessionId={setSessionId} />
            </div>
          )}
        </Transition>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: '0' }}>
          {sessionId && <Results sessionId={sessionId} />}
        </div>
      </Flex>
    </MainDashboardLayout>
  );
}
