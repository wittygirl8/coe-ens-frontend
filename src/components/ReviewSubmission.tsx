import { useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Group, LoadingOverlay } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useWebSocket from 'react-use-websocket';

import { useAppContext } from '../contextAPI/AppContext';
import { DataGrid } from './DataGrid';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';

const columns = [
  { accessor: 'uploaded_name', title: 'Name' },
  { accessor: 'uploaded_national_id', title: 'National Id' },
  { accessor: 'uploaded_country', title: 'Country' },
  { accessor: 'uploaded_state', title: 'State' },
  { accessor: 'uploaded_city', title: 'City' },
  { accessor: 'uploaded_address', title: 'Address' },
  { accessor: 'uploaded_postcode', title: 'Postcode' },
  { accessor: 'uploaded_email_or_website', title: 'Email or Website' },
  { accessor: 'uploaded_phone_or_fax', title: 'Phone or Fax' },
];

function UserUploadedListConfirmation({
  nextStep,
}: Readonly<{ nextStep: () => void }>) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { sessionId, setActiveStep } = useAppContext();

  const { lastMessage } = useWebSocket(
    `${API_ENDPOINTS.STREAMING_SESSION_STATUS(sessionId)}`,
    {
      shouldReconnect: () => true, // Auto-reconnect on close
    }
  );

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      if (data.supplier_name_validation_status === 'COMPLETED') {
        setIsLoading(false);
        nextStep();
      } else if (
        data.supplier_name_validation_status === 'FAILED' ||
        data.overall_status === 'FAILED'
      ) {
        notifications.show({
          title: 'Error',
          message:
            'Supplier name validation failed: Please re-check the uploaded data and try again',
          position: 'top-right',
          color: 'red',
          autoClose: false,
        });
        setIsLoading(false);
        setActiveStep(0);
      }
    }
  }, [lastMessage]);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(API_ENDPOINTS.TRIGGER_SUPPLIER_VALIDATION, {
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error validating entity list:', error);
    }
  };

  return (
    <>
      <Box pos={'relative'}>
        <LoadingOverlay
          visible={isLoading}
          loaderProps={{
            children: (
              <ActionIcon variant="subtle" color="black">
                <IconLock size={40} />
              </ActionIcon>
            ),
          }}
        />
        <DataGrid
          fetchUrl={API_ENDPOINTS.GET_SUPPLIER_DATA(sessionId)}
          records={records}
          setRecords={setRecords}
          columns={columns.map((column) => ({
            ...column,
            noWrap: true,
            ellipsis: undefined, // Ensure ellipsis is explicitly set to undefined
          }))}
          idAccessor="id"
        />
      </Box>
      <Group justify="end" mt="xl">
        <Button onClick={handleClick} loading={isLoading}>
          Validate Uploaded Entity List
        </Button>
      </Group>
    </>
  );
}

export default function ReviewSubmission({
  nextStep,
}: Readonly<{ nextStep: () => void }>) {
  return (
    <div>
      <UserUploadedListConfirmation nextStep={nextStep} />
    </div>
  );
}
