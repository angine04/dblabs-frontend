import { IconBook2, IconChartBar, IconDashboard, IconUsers } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Group, Stack, Text, ThemeIcon, UnstyledButton, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick: () => void;
  index: number;
}

function NavItem({ icon, label, active, onClick, index }: NavItemProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50 * (index + 1));
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Transition
      mounted={mounted}
      transition={{
        in: { opacity: 1, transform: 'translateX(0)' },
        out: { opacity: 0, transform: 'translateX(-20px)' },
        transitionProperty: 'transform, opacity, background-color',
        common: { transition: 'all 0.3s ease' },
      }}
      duration={300}
    >
      {(styles) => (
        <UnstyledButton
          onClick={onClick}
          style={(theme) => ({
            ...styles,
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colors.dark[0],
            backgroundColor: active ? theme.colors.blue[1] : 'transparent',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.colors.blue[1],
              transform: 'translateX(5px)',
            },
          })}
        >
          <Group>
            <ThemeIcon 
              variant={active ? 'filled' : 'light'} 
              size="lg"
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              {icon}
            </ThemeIcon>
            <Text 
              size="sm" 
              c="black"
              style={{
                transition: 'all 0.3s ease',
                transform: active ? 'translateX(3px)' : 'none',
              }}
            >
              {label}
            </Text>
          </Group>
        </UnstyledButton>
      )}
    </Transition>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: <IconDashboard size={18} /> },
    { path: '/students', label: 'Students', icon: <IconUsers size={18} /> },
    { path: '/courses', label: 'Courses', icon: <IconBook2 size={18} /> },
    { path: '/grades', label: 'Grades', icon: <IconChartBar size={18} /> },
  ];

  return (
    <AppShell.Navbar p="md">
      <Transition
        mounted={isVisible}
        transition={{
          in: { opacity: 1, transform: 'translateX(0)' },
          out: { opacity: 0, transform: 'translateX(-20px)' },
          transitionProperty: 'transform, opacity',
        }}
        duration={400}
      >
        {(styles) => (
          <Stack gap="md" style={styles}>
            {navigation.map((item, index) => (
              <NavItem
                key={item.path}
                {...item}
                index={index}
                active={
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                }
                onClick={() => navigate(item.path)}
              />
            ))}
          </Stack>
        )}
      </Transition>
    </AppShell.Navbar>
  );
}
