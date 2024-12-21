import { AppShell, Stack, UnstyledButton, Group, Text, ThemeIcon } from '@mantine/core';
import { 
  IconDashboard, 
  IconUsers, 
  IconBook2, 
  IconChartBar,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        backgroundColor: active ? theme.colors.blue[1] : 'transparent',
        '&:hover': {
          backgroundColor: theme.colors.blue[1],
        },
      })}
    >
      <Group>
        <ThemeIcon variant={active ? 'filled' : 'light'} size="lg">
          {icon}
        </ThemeIcon>
        <Text size="sm" c="black">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: <IconDashboard size={18} /> },
    { path: '/students', label: 'Students', icon: <IconUsers size={18} /> },
    { path: '/courses', label: 'Courses', icon: <IconBook2 size={18} /> },
    { path: '/grades', label: 'Grades', icon: <IconChartBar size={18} /> },
  ];

  return (
    <AppShell.Navbar p="md">
        <Stack gap="md">
          {navigation.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </Stack>
    </AppShell.Navbar>
  );
} 