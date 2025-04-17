import { useEffect, useState } from 'react';
import {
  Title,
  Transition,
  Burger,
  Flex,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';
import { useDisclosure, useSetState } from '@mantine/hooks';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { io } from 'socket.io-client';

import MainDashboardLayout from '../layouts/MainDashboardLayout';
import Results from '../components/Results';
import { DataGrid } from '../components/DataGrid';
import { API_ENDPOINTS, ORBIS_URL } from '../config';
import { useAppContext } from '../contextAPI/AppContext';

type SessionInfo = {
  session_id: string;
  create_time: string;
  overall_status: 'COMPLETED' | 'IN-PROGRESS' | 'FAILED';
};

const socket = io(ORBIS_URL);

const SessionStatus = ({
  overall_status = 'IN-PROGRESS',
}: {
  overall_status: 'COMPLETED' | 'IN-PROGRESS' | 'FAILED';
}) => {
  if (overall_status === 'COMPLETED') {
    return (
      <Badge
        color="green"
        variant="subtle"
        leftSection={
          <ActionIcon variant="subtle" color="green" size={'xs'}>
            <IconCheck size={16} />
          </ActionIcon>
        }
      >
        Completed
      </Badge>
    );
  }

  if (overall_status === 'FAILED') {
    return (
      <Badge
        color="red"
        variant="subtle"
        leftSection={
          <ActionIcon variant="subtle" color="red" size={'xs'}>
            <IconAlertTriangle size={16} />
          </ActionIcon>
        }
      >
        Failed
      </Badge>
    );
  }

  return (
    <Badge
      color="orange"
      variant="subtle"
      leftSection={
        <ActionIcon
          variant="subtle"
          loading
          color="orange"
          size={'xs'}
        ></ActionIcon>
      }
    >
      In-progress
    </Badge>
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
    render: ({ overall_status }) => (
      <SessionStatus overall_status={overall_status} />
    ),
  },
];

function SessionTable({
  sessionState,
  setSessionState,
}: Readonly<{
  sessionState: Partial<SessionInfo>;
  setSessionState: (state: any) => void;
}>) {
  const [records, setRecords] = useState<SessionInfo[]>([]);

  const onRowClick = (args: { record: SessionInfo }) => {
    setSessionState(args.record);
  };

  const rowBackgroundColor = (record: SessionInfo) => {
    if (record.session_id === sessionState.session_id)
      return { dark: '#000', light: '#d3dce2' };
    else return { dark: '', light: '' };
  };

  useEffect(() => {
    socket.on('session-status', (data) => {
      setRecords((prevRecords) => {
        const recordIndex = prevRecords.findIndex(
          (record) => record.session_id === data.session_id
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

      if (data.session_id === sessionState.session_id) {
        setSessionState((prevState: Partial<SessionInfo>) => ({
          ...prevState,
          overall_status: data.overall_status,
        }));
      }
    });

    return () => {
      socket.off('session-status');
    };
  }, []);

  useEffect(() => {
    if (!sessionState.session_id && records.length > 0) {
      setSessionState(records[0]);
    }
  }, [records]);

  return (
    <div>
      <DataGrid
        idAccessor="session_id"
        records={records}
        setRecords={setRecords}
        fetchUrl={API_ENDPOINTS.GET_SESSION_SCREENING_STATUS}
        onRowClick={onRowClick}
        rowBackgroundColor={rowBackgroundColor}
        striped={false}
        highlightOnHover={false}
        height="60dvh"
        staleTime={1}
        scrollAreaProps={{ offsetScrollbars: true }}
        columns={columns.map((column) => ({
          ...column,
          noWrap: true,
          ellipsis: undefined,
        }))}
      />
    </div>
  );
}

export default function AnalysisHub() {
  const [opened, { toggle }] = useDisclosure(true);
  const { setActiveStep } = useAppContext();

  const [sessionState, setSessionState] = useSetState<Partial<SessionInfo>>({});

  useEffect(() => {
    setActiveStep(0);
  }, []);

  return (
    <MainDashboardLayout>
      <Flex justify="space-between" gap="md" style={{ overflow: 'hidden' }}>
        <Burger opened={opened} onClick={toggle} size="sm" />
        <Transition
          mounted={opened}
          transition="scale-x"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <div
              style={{
                ...styles,
                flexShrink: 0, // Prevents scrollbar
                overflow: 'hidden',
              }}
            >
              <Title order={3} fw={500} mb="md">
                Sessions Info
              </Title>
              <SessionTable
                sessionState={sessionState}
                setSessionState={setSessionState}
              />
            </div>
          )}
        </Transition>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: '0' }}>
          {sessionState?.session_id ? (
            <Results
              sessionId={sessionState.session_id}
              sessionStatus={sessionState.overall_status}
            />
          ) : null}
        </div>
      </Flex>
    </MainDashboardLayout>
  );
}
