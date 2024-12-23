import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 180,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <MantineAppShell.Header>
        <AppHeader opened={opened} toggle={toggle} />
      </MantineAppShell.Header>
      <MantineAppShell.Navbar>
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
