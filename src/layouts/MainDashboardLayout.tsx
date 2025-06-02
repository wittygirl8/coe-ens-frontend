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
import { useAppContext } from '../contextAPI/AppContext';

function UserMenu() {
  const { setColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  return (
    <Menu shadow="md" width={200} withArrow position="bottom-end" zIndex={2000}>
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

const NewSessionButton = () => {
  const { activeStep, setActiveStep } = useAppContext();

  const handleClick = () => {
    if (activeStep !== 0 && activeStep < 3) {
      const confirmLeave = window.confirm(
        'You’re in the middle of a process. Leaving now will discard your progress. Continue?'
      );

      if (!confirmLeave) return;
    }

    if (activeStep !== 0) {
      setActiveStep(0);
    }
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      className={clsx(classes.control)}
      component={NavLink}
      to="/new-session"
      style={{ marginTop: '4px' }}
    >
      New Session
    </UnstyledButton>
  );
};

export default function MainDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: '4rem' }}
      footer={{ height: '3rem' }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Container size={'105rem'}>
          <Group h="100%">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group justify="space-between" style={{ flex: 1 }}>
              <Text
                size="xl"
                fw={700}
                variant="gradient"
                ta={'center'}
                tt="uppercase"
                lts="1px"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                component={NavLink}
                style={{ border: 'none' }}
                to="/"
              >
                ENS - Entity Screening
              </Text>
              <Group ml="xl" gap={0} visibleFrom="sm">
                <UnstyledButton
                  to={'/'}
                  component={NavLink}
                  style={{ marginTop: '4px' }}
                  className={clsx(classes.control)}
                >
                  Network Graph
                </UnstyledButton>
                <NewSessionButton />
                <UnstyledButton
                  to={'/analysis-hub'}
                  component={NavLink}
                  className={clsx(classes.control)}
                  style={{ marginTop: '4px' }}
                >
                  Analysis Hub
                </UnstyledButton>
                <UnstyledButton
                  component={NavLink}
                  target="_blank"
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

      <AppShell.Main className="custom-background">
        <Container size={'105rem'}>{children}</Container>
      </AppShell.Main>
      <AppShell.Footer p="md">
        <Container size={'105rem'}>
          <Flex gap="md" justify={'space-between'} align="center">
            <Text size="xs" ta={'right'}>
              &copy; {new Date().getFullYear()} ENS - Entity Screening. All
              rights reserved.
            </Text>
            <Flex gap="xl">
              <Text
                size="xs"
                component={'a'}
                href="https://coe-poc-frontend.onrender.com/"
                target="_blank"
              >
                ENS - 2 Sents!
              </Text>
              <Text
                size="xs"
                component={'a'}
                href="https://eyapp.southindia.cloudapp.azure.com/hrtp/"
                target="_blank"
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
