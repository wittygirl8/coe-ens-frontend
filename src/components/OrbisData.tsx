import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  Text,
  useModalsStack,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconLock,
  IconSelect,
  IconX,
  IconZoomQuestion,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';

import { Supplier } from '../types';
import { useAppContext } from '../contextAPI/AppContext';
import axiosInstance from '../utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../config';
import { usePagination } from '../hooks/usePagination';

const AcceptButton = ({ onClick }: { onClick: () => void }) => (
  <ActionIcon
    variant="light"
    color="green"
    title="Accept Suggestion"
    onClick={onClick}
  >
    <IconCheck size={16} />
  </ActionIcon>
);

const RejectButton = ({ onClick }: { onClick: () => void }) => (
  <ActionIcon
    variant="light"
    color="red"
    title="Reject Suggestion"
    onClick={onClick}
  >
    <IconX size={16} />
  </ActionIcon>
);

const ConfirmationModal = ({
  id,
  title,
  isAccept,
  handleConfirm,
  stack,
}: {
  id: string;
  title: string;
  isAccept: boolean;
  handleConfirm: (isAccept: boolean) => void;
  stack: any;
}) => {
  const { sessionId } = useAppContext();

  const { data } = useQuery({
    queryKey: ['nomatch_count', sessionId],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(
          API_ENDPOINTS.SUPPLIER_NO_MATCH_COUNT(sessionId)
        );

        return data;
      } catch (error) {
        console.error('Error fetching supplier data:', error);
      }
    },
  });

  return (
    <Modal {...stack.register(id)} title="Are you sure?" size={'lg'}>
      You are about to{' '}
      <Text span fw="bolder">
        {title}
      </Text>{' '}
      for all{' '}
      <Text span fw="bold">
        {data?.data?.not_validated_count} Records
      </Text>
      . <br /> If you are sure, press confirm button below.
      <Group mt="lg" justify="flex-end">
        <Button onClick={stack.closeAll} variant="default">
          Cancel
        </Button>
        <Button
          onClick={() => {
            stack.closeAll();
            handleConfirm(isAccept);
          }}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
};

const updateSuggestions = async (url: string, body: object) => {
  const result = await axiosInstance.put(url, body);
  return result.data;
};

export function OrbisData({ nextStep }: Readonly<{ nextStep: () => void }>) {
  const [records, setRecords] = useState<Supplier[]>([]);
  const [enableStartAnalysis, setEnableStartAnalysis] = useState(false);
  const { resetPage, page, setPage, pageSize, setPageSize, PAGE_SIZES } =
    usePagination();

  const localCache = useRef<{ [key: string]: boolean }>({});
  const stack = useModalsStack([
    'accept-all',
    'reject-all',
    'attention-required',
    'start-analysis',
  ]);
  const [showOnlySuggestions, setShowOnlySuggestions] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const { sessionId } = useAppContext();
  const baseUrl = API_ENDPOINTS.GET_SUPPLIER_DATA(sessionId);

  const fetchUrl = showOnlySuggestions
    ? `${baseUrl}&final_validation_status=review`
    : `${baseUrl}`;

  const updatedRecords = records.map((record: Supplier) => {
    if (localCache.current[record.ens_id] !== undefined) {
      return { ...record, isAccepted: localCache.current[record.ens_id] };
    }
    return record;
  });

  const acceptRejectSuggestion = (ensId: string, accepted: boolean) => {
    localCache.current[ensId] = accepted;

    setRecords((prev) =>
      prev.map((record) =>
        record.ens_id === ensId ? { ...record, isAccepted: accepted } : record
      )
    );
  };

  const getActionButtons = (ens_id: string, isAccepted?: boolean) => {
    const handleAccept = () => acceptRejectSuggestion(ens_id, true);
    const handleReject = () => acceptRejectSuggestion(ens_id, false);

    return (
      <Flex wrap="nowrap" gap="sm" justify="center">
        {isAccepted === true ? (
          <>
            <Button
              variant="light"
              color="green"
              leftSection={<IconCheck size={16} />}
              size="xs"
            >
              Accepted
            </Button>
            <RejectButton onClick={handleReject} />
          </>
        ) : isAccepted === false ? (
          <>
            <AcceptButton onClick={handleAccept} />
            <Button
              variant="light"
              color="red"
              leftSection={<IconX size={16} />}
              size="xs"
            >
              Rejected
            </Button>
          </>
        ) : (
          <>
            <AcceptButton onClick={handleAccept} />
            <RejectButton onClick={handleReject} />
          </>
        )}
      </Flex>
    );
  };

  const triggerStartAnalysis = async () => {
    setEnableStartAnalysis(false);
    try {
      await axiosInstance.post(API_ENDPOINTS.TRIGGER_ANALYSIS, {
        session_id: sessionId,
      });
      nextStep();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setEnableStartAnalysis(true);
    }
  };

  const handleStartAnalysis = async (
    autoAcceptOrReject: boolean | null = null
  ) => {
    try {
      if (autoAcceptOrReject !== null) {
        // Bulk update when autoAcceptOrReject is provided
        return await updateSuggestions(API_ENDPOINTS.UPDATE_SUGGESTION_BULK, {
          session_id: sessionId,
          status: autoAcceptOrReject ? 'accept' : 'reject',
        });
      }

      const userReviewChanges = Object.entries(localCache.current).map(
        ([ens_id, isAccepted]) => ({
          ens_id,
          status: isAccepted ? 'accept' : 'reject',
        })
      );

      if (userReviewChanges.length === 0) {
        await updateSuggestions(API_ENDPOINTS.UPDATE_SUGGESTION_BULK, {
          session_id: sessionId,
          status: 'reject',
        });
      }

      if (userReviewChanges.length > 0) {
        // Single update when user review changes exist
        await updateSuggestions(
          API_ENDPOINTS.UPDATE_SUGGESTION_SINGLE(sessionId),
          userReviewChanges
        );
      }

      setEnableStartAnalysis(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns: Array<DataTableColumn<Supplier>> = [
    { accessor: 'uploaded_name', title: 'Name' },
    {
      accessor: 'match_found',
      title: 'Validation Result',
      textAlign: 'center',
      filter: () => (
        <Checkbox
          label="Show Review Only"
          description="Show only records with suggestions"
          checked={showOnlySuggestions}
          onChange={() => {
            resetPage();
            setShowOnlySuggestions((current) => !current);
          }}
        />
      ),
      render: ({
        final_validation_status,
        duplicate_in_session,
        validation_status,
      }: {
        final_validation_status: 'AUTO_ACCEPT' | 'AUTO_REJECT' | 'REVIEW';
        duplicate_in_session: 'RETAIN' | 'REMOVE' | 'UNIQUE';
        validation_status: 'VALIDATED' | 'NOT_VALIDATED' | 'PENDING';
      }) => {
        if (final_validation_status === 'AUTO_ACCEPT')
          return (
            <ActionIcon
              variant="subtle"
              color="green"
              title="Direct Match Found For Upload"
            >
              <IconCheck size={16} />
            </ActionIcon>
          );

        if (final_validation_status === 'REVIEW')
          return (
            <ActionIcon
              variant="subtle"
              color="orange"
              title="Match Found - Requires Review"
            >
              <IconZoomQuestion size={16} />
            </ActionIcon>
          );

        if (
          (final_validation_status === 'AUTO_REJECT' &&
            duplicate_in_session === 'REMOVE') ||
          (final_validation_status === 'AUTO_REJECT' &&
            validation_status === 'NOT_VALIDATED')
        )
          return (
            <ActionIcon
              variant="subtle"
              color="red"
              title="Duplicate or No Match, Will Be Removed From Analysis"
            >
              <IconAlertTriangle size={16} />
            </ActionIcon>
          );
      },
    },
    {
      accessor: 'suggested_name',
      title: 'Suggested Name',
    },
    { accessor: 'uploaded_national_id', title: 'National Id' },
    { accessor: 'suggested_national_id', title: 'Suggested National ID' },
    { accessor: 'uploaded_country', title: 'Country' },
    { accessor: 'suggested_country', title: 'Suggested Country' },
    { accessor: 'uploaded_state', title: 'State' },
    { accessor: 'suggested_state', title: 'Suggested State' },
    { accessor: 'uploaded_city', title: 'City' },
    { accessor: 'suggested_city', title: 'Suggested City' },
    { accessor: 'uploaded_address', title: 'Address' },
    { accessor: 'suggested_address', title: 'Suggested Address' },
    { accessor: 'uploaded_postcode', title: 'Postcode' },
    { accessor: 'suggested_postcode', title: 'Suggested Postcode' },
    { accessor: 'uploaded_email_or_website', title: 'Email or Website' },
    {
      accessor: 'suggested_email_or_website',
      title: 'Suggested Email or Website',
    },
    { accessor: 'uploaded_phone_or_fax', title: 'Phone or Fax' },
    { accessor: 'suggested_phone_or_fax', title: 'Suggested Phone or Fax' },
    {
      accessor: 'acceptReject',
      title: (
        <div>
          <Flex justify={'center'} align={'center'}>
            <Text fw={'bold'} style={{ fontSize: '0.9rem' }}>
              Review Suggestion
            </Text>
            <Menu
              withArrow
              width={300}
              position="bottom-end"
              transitionProps={{ transition: 'pop' }}
              withinPortal
            >
              <Menu.Target>
                <ActionIcon variant="default" ml="sm" bd="none">
                  <IconSelect size={16} stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Approve</Menu.Label>
                <Menu.Item
                  color="green"
                  leftSection={<IconCheck size={14} />}
                  onClick={() => stack.open('accept-all')}
                >
                  Accept All Suggestions
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconX size={14} />}
                  onClick={() => stack.open('reject-all')}
                >
                  Reject All Suggestions
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </div>
      ),
      textAlign: 'center',
      render: ({
        final_validation_status,
        ens_id,
        isAccepted,
        duplicate_in_session,
        validation_status,
      }: {
        final_validation_status: 'AUTO_ACCEPT' | 'AUTO_REJECT' | 'REVIEW';
        ens_id: string;
        isAccepted?: boolean;
        duplicate_in_session: 'RETAIN' | 'REMOVE' | 'UNIQUE';
        validation_status: 'VALIDATED' | 'NOT_VALIDATED' | 'PENDING';
      }) => {
        if (final_validation_status === 'AUTO_ACCEPT') {
          return null;
        }

        if (final_validation_status === 'REVIEW') {
          return getActionButtons(ens_id, isAccepted);
        }

        if (
          final_validation_status === 'AUTO_REJECT' &&
          duplicate_in_session === 'REMOVE'
        )
          return (
            <Text c="red" size="sm">
              Duplicate Match
            </Text>
          );

        if (
          final_validation_status === 'AUTO_REJECT' &&
          validation_status === 'NOT_VALIDATED'
        )
          return (
            <Text c="red" size="sm">
              Entity Not Found
            </Text>
          );
      },
    },
  ];

  const handleConfirm = async (isAccept: boolean) => {
    await handleStartAnalysis(isAccept);
    triggerStartAnalysis();
  };

  const { isFetching, data, isError, error } = useQuery({
    queryKey: ['nameValidation', fetchUrl, page, pageSize],
    queryFn: async () => {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}page_no=${page}&rows_per_page=${pageSize}`;
      const { data } = await axiosInstance.get(url);
      return data;
    },
    staleTime: Infinity,
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
    <>
      <Modal.Stack>
        <ConfirmationModal
          id="accept-all"
          title="Accept All Suggestions"
          isAccept={true}
          handleConfirm={handleConfirm}
          stack={stack}
        />
        <ConfirmationModal
          id="reject-all"
          title="Reject All Suggestions"
          isAccept={false}
          handleConfirm={handleConfirm}
          stack={stack}
        />

        <Modal
          {...stack.register('attention-required')}
          title={
            <Flex align="center" gap={'sm'}>
              <IconAlertTriangle size={16} color="orange" />
              <Text>Attention Required</Text>
            </Flex>
          }
        >
          Rows that have not been reviewed will be rejected and will not be
          included in the analysis
          <Group mt="lg" justify="flex-end">
            <Button onClick={stack.closeAll} variant="default">
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                stack.closeAll();
                setFreeze(true);
                handleStartAnalysis();
              }}
            >
              Proceed
            </Button>
          </Group>
        </Modal>

        <Modal
          {...stack.register('start-analysis')}
          title="Are you sure?"
          overlayProps={{
            backgroundOpacity: 0.75,
            blur: 4,
          }}
        >
          You are about to Start the Analysis. If you are sure, press confirm
          button below.
          <Group mt="sm" justify="flex-end">
            <Button onClick={stack.closeAll} variant="default">
              Cancel
            </Button>
            <Button
              onClick={() => {
                stack.closeAll();
                triggerStartAnalysis();
              }}
            >
              Confirm
            </Button>
          </Group>
        </Modal>
      </Modal.Stack>

      <Box pos={'relative'}>
        <LoadingOverlay
          visible={stack.state['start-analysis'] ? false : freeze}
          loaderProps={{
            children: (
              <ActionIcon variant="subtle" color="black">
                <IconLock size={40} />
              </ActionIcon>
            ),
          }}
        />

        <DataTable
          shadow="sm"
          minHeight={400}
          fetching={isFetching}
          withTableBorder
          totalRecords={data?.data.total_data}
          recordsPerPage={pageSize}
          records={updatedRecords}
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
          columns={columns.map((column) => ({
            ...column,
            noWrap: true,
            ellipsis: undefined,
          }))}
          pinLastColumn
        />
      </Box>
      <Flex justify="end" mt="lg">
        {freeze ? (
          <Button
            onClick={() => stack.open('start-analysis')}
            disabled={!enableStartAnalysis}
          >
            Start Analysis
          </Button>
        ) : (
          <Flex justify="space-between" gap="sm" w="100%">
            <Flex direction="column" gap="xs">
              {[
                {
                  icon: <IconCheck size={16} />,
                  color: 'green',
                  text: 'Direct Match Found For Upload',
                },
                {
                  icon: <IconZoomQuestion size={16} />,
                  color: 'orange',
                  text: 'Match Found - Requires Review',
                },
                {
                  icon: <IconAlertTriangle size={16} />,
                  color: 'red',
                  text: 'Duplicate or No Match, Will Be Removed From Analysis',
                },
              ].map(({ icon, color, text }) => (
                <Flex key={color} align="center">
                  <ActionIcon variant="subtle" color={color}>
                    {icon}
                  </ActionIcon>
                  <Text span c={color}>
                    {text}
                  </Text>
                </Flex>
              ))}
            </Flex>

            <Button onClick={() => stack.open('attention-required')}>
              Confirm Review
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  );
}
