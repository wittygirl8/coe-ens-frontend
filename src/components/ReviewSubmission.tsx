import { useState } from 'react';
import { ActionIcon, Box, Button, Group, LoadingOverlay } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

import { useAppContext } from '../contextAPI/AppContext';
import { DataGrid } from './DataGrid';
import { useQuery } from '@tanstack/react-query';
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

  const { sessionId } = useAppContext();

  useQuery<{ data: { supplier_name_validation_status: string } }>({
    queryKey: [API_ENDPOINTS.SESSION_STATUS(sessionId)],
    // queryFn: async () => {
    //   try {
    //     const { data } = await axiosInstance.get(
    //       API_ENDPOINTS.SESSION_STATUS(sessionId),
    //     );

    //     return data;
    //   } catch (error) {
    //     console.error('Error fetching supplier data: jj', error);
    //   }
    // },
    enabled: isLoading,
    refetchInterval: (query) => {
      if (
        query.state.data?.data.supplier_name_validation_status === 'COMPLETED'
      ) {
        setIsLoading(false);
        nextStep();
        return false;
      }

      return 5000; // 5 seconds
    },
  });

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(API_ENDPOINTS.TRIGGER_SUPPLIER_VALIDATION, {
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error validating supplier list:', error);
    }
  };

  return (
    <>
      <Box pos={'relative'}>
        <LoadingOverlay
          visible={isLoading}
          loaderProps={{
            children: (
              <ActionIcon variant='subtle' color='black'>
                <IconLock size={40} />
              </ActionIcon>
            ),
          }}
        />
        <DataGrid
          fetchUrl={API_ENDPOINTS.GET_SUPPLIER_DATA(sessionId)}
          records={records}
          setRecords={setRecords}
          columns={columns}
          height='50dvh'
          idAccessor='id'
        />
      </Box>
      <Group justify='end' mt='xl'>
        <Button onClick={handleClick} loading={isLoading}>
          Validate Uploaded Supplier List
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
