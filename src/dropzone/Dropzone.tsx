import {
  Button,
  Card,
  Flex,
  Group,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconDownload, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';

import classes from './DropzoneButton.module.css';
import { useAppContext } from '../contextAPI/AppContext';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';

export default function DropzoneButton({ nextStep }: { nextStep: () => void }) {
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  const { setSessionId } = useAppContext();

  const handleDrop = async (files: File[]) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const { data } = await axiosInstance.post(
        API_ENDPOINTS.UPLOAD_EXCEL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSessionId(data.data.session_id);
      nextStep();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        notifications.show({
          title: 'Excel Processing Error',
          message:
            "We couldn't process the uploaded Excel file due to errors. Please check and fix the errors in the file, then try again",
          color: 'red',
          position: 'top-right',
          autoClose: false,
        });

        return;
      }

      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Card shadow='sm' p='md' radius='md' maw={'50em'} m='auto' withBorder>
        <Card.Section>
          <Dropzone
            openRef={openRef}
            onDrop={handleDrop}
            className={classes.dropzone}
            radius='md'
            accept={[MIME_TYPES.xlsx]}
            maxSize={30 * 1024 ** 2}
            multiple={false}
            mt={'xs'}
            m={'xs'}
            loading={loading}
          >
            <div style={{ pointerEvents: 'none' }}>
              <Group justify='center'>
                <Dropzone.Accept>
                  <IconDownload
                    size={50}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={50} color={theme.colors.red[6]} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconCloudUpload size={50} stroke={1.5} />
                </Dropzone.Idle>
              </Group>

              <Text ta='center' fw={700} fz='lg' mt='xs'>
                <Dropzone.Accept>Drop files here</Dropzone.Accept>
                <Dropzone.Reject>
                  Upload Single Excel file less than 30mb
                </Dropzone.Reject>
                <Dropzone.Idle>Upload Vendor List</Dropzone.Idle>
              </Text>
              <Text ta='center' fz='sm' mt='xs' c='dimmed'>
                Drag&apos;n&apos;drop file here to upload. We can accept only
                excel
                <Text component='i'>(.xlsx)</Text> files that are less than 30mb
                in size.
              </Text>
            </div>
          </Dropzone>
        </Card.Section>

        <Card.Section>
          <Flex justify={'center'}>
            <Button
              className={classes.control}
              size='md'
              mt='xs'
              radius='xl'
              onClick={() => openRef.current?.()}
            >
              Select File
            </Button>
          </Flex>
        </Card.Section>
      </Card>
    </div>
  );
}
