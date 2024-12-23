import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Text, Title } from '@mantine/core';

export function ErrorBoundary() {
  const navigate = useNavigate();

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="md">
        <Title>Oops! Something went wrong</Title>
        <Text>We encountered an error while loading this page.</Text>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </Stack>
    </Container>
  );
}
