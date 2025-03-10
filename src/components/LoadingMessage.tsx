import { Flex, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

const loadingMessages = [
  'Processing your request...',
  'Fetching data, hang tight!',
  'Almost done, just a moment...',
  'Connecting to the server...',
  'Retrieving information, stay tuned!',
];

const LoadingMessage = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;

      setMessage(loadingMessages[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Flex direction={'column'} align='center' justify={'center'} h='50vh'>
        <Text fz={'lg'}>{message}</Text>
        <Loader type='dots' />
      </Flex>
    </div>
  );
};

export default LoadingMessage;
