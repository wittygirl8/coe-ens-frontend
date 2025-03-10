import { Button, Flex, Image, Title } from '@mantine/core';

export default function ErrorFallback() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
      <Flex direction={'column'} align={'center'} justify={'center'}>
        <Image src='/illustrations/error.svg' h={500} w={500} alt='No data' />
        <Title order={3} fw={500} c='dimmed'>
          Something went wrong, Apologies! We're fixing the issue.
        </Title>
        <Button w={200} m='auto' mt='md' onClick={handleRefresh}>
          Refresh the page
        </Button>
      </Flex>
    </div>
  );
}
