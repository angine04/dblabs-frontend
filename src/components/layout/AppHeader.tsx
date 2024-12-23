import { Burger, Flex, Group, Text } from '@mantine/core';

interface AppHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function AppHeader({ opened, toggle }: AppHeaderProps) {
  return (
    <Flex h="100%" px="md" align="center" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Text size="lg" fw={700}>
          Student Management System
        </Text>
      </Group>
    </Flex>
  );
}
