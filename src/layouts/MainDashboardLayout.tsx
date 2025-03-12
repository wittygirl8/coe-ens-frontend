import {
  AppShell,
  Burger,
  Group,
  UnstyledButton,
  Menu,
  Text,
  Avatar,
  Container,
  useMantineColorScheme,
  Flex,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import clsx from 'clsx';
import {
  IconArrowsExchange,
  IconLogout,
  IconMoon,
  IconSun,
  IconDeviceDesktop,
} from '@tabler/icons-react';

import classes from '../styles/MobileNavbar.module.css';
import { NavLink, useNavigate } from 'react-router';

function UserMenu() {
  const { setColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  return (
    <Menu shadow='md' width={200} withArrow position='bottom-end' zIndex={2000}>
      <Menu.Target>
        <Avatar style={{ cursor: 'pointer' }} />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        <Menu.Item
          leftSection={<IconMoon size={14} />}
          onClick={() => {
            setColorScheme('dark');
          }}
        >
          Dark
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSun size={14} />}
          onClick={() => setColorScheme('light')}
        >
          Light
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={14} />}
          onClick={() => setColorScheme('auto')}
        >
          Auto
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconArrowsExchange size={14} />}>
          Change Password
        </Menu.Item>
        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function MainDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding='md'
    >
      <AppShell.Header>
        <Container size={'105rem'}>
          <Group h='100%'>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom='sm'
              size='sm'
            />
            <Group justify='space-between' style={{ flex: 1 }}>
              <Text
                size='xl'
                fw={700}
                variant='gradient'
                ta={'center'}
                tt='uppercase'
                lts='1px'
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                component={NavLink}
                style={{ border: 'none' }}
                to='/'
              >
                ENS - Supplier Screening
              </Text>
              <Group ml='xl' gap={0} visibleFrom='sm'>
                <UnstyledButton
                  className={clsx(classes.control)}
                  to={'/'}
                  component={NavLink}
                >
                  New Session
                </UnstyledButton>
                <UnstyledButton
                  component={NavLink}
                  target='_blank'
                  to={
                    'https://app.powerbi.com/groups/me/reports/b2cf46fe-88fe-4702-a68e-2fb4a9095010/5303e6a3795016306840?experience=power-bi'
                  }
                  className={classes.control}
                >
                  Power BI- Dashboard
                </UnstyledButton>
                <UserMenu />
              </Group>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main className='custom-background'>
        <Container size={'105rem'}>{children}</Container>
      </AppShell.Main>
      <AppShell.Footer p='md'>
        <Container size={'105rem'}>
          <Flex gap='md' justify={'space-between'} align='center'>
            <Text size='xs' ta={'right'}>
              &copy; {new Date().getFullYear()} ENS - Supplier Screening. All
              rights reserved.
            </Text>
            <Flex gap='xl'>
              <Text
                size='xs'
                component={'a'}
                href='https://coe-poc-frontend.onrender.com/'
                target='_blank'
              >
                ENS - 2 Sents!
              </Text>
              <Text
                size='xs'
                component={'a'}
                href='https://eyapp.southindia.cloudapp.azure.com/hrtp/'
                target='_blank'
              >
                HRTP
              </Text>
            </Flex>
          </Flex>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}
