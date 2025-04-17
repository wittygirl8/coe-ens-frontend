import { Box, Button, Flex, Image, Title } from '@mantine/core';
import { NavLink } from 'react-router';

const NotFound = () => {
  return (
    <Box style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
      <Flex direction={'column'} align={'center'} justify={'center'}>
        <Image src="/illustrations/error.svg" h={500} w={500} alt="No data" />
        <Title order={3} fw={500} c="dimmed">
          404: Page Not Found
        </Title>
        <p>Oops! The page you're looking for doesn't exist.</p>

        <Button component={NavLink} to="/">
          Go Back to Home
        </Button>
      </Flex>
    </Box>
  );
};

export default NotFound;
