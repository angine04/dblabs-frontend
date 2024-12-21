import React from 'react';
import { Container, Grid, Card, Text, Group, Badge, Button, Stack, Table, ActionIcon, LoadingOverlay } from '@mantine/core';
import { IconEdit, IconUserPlus, IconDownload } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useCourse } from '../../hooks/useCourses';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

export function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  if (!id) {
    return <Text>Course ID not found</Text>;
  }

  const { data: course, isLoading, error } = useCourse(id);
  const queryClient = useQueryClient();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }
  if (error) {
    return <Text c="red">Error loading course details</Text>;
  }
  if (!course) {
    return <Text>Course not found</Text>;
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Stack gap={0}>
          <Text size="xl" fw={700}>{course.name}</Text>
          <Text c="dimmed">{course.code}</Text>
        </Stack>
        <Group>
          <Button
            variant="light"
            leftSection={<IconEdit size={20} />}
            onClick={() => navigate(`/courses/${id}/edit`)}
          >
            Edit Course
          </Button>
          <Button
            leftSection={<IconUserPlus size={20} />}
          >
            Manage Students
          </Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <Card withBorder>
              <Text fw={500} mb="md">Course Information</Text>
              <Stack gap="xs">
                <Group>
                  <Text fw={500}>Credits:</Text>
                  <Text>{course.credits}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Instructor:</Text>
                  <Text>{course.instructor}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Semester:</Text>
                  <Text>{course.semester}</Text>
                </Group>
                <Group>
                  <Text fw={500}>Status:</Text>
                  <Badge>{course.status}</Badge>
                </Group>
              </Stack>
            </Card>

            <Card withBorder>
              <Text fw={500} mb="md">Course Schedule</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Start Time</Table.Th>
                    <Table.Th>End Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {course.schedule.map((schedule: Schedule, index: number) => (
                    <Table.Tr key={index}>
                      <Table.Td>{schedule.day}</Table.Td>
                      <Table.Td>{schedule.startTime}</Table.Td>
                      <Table.Td>{schedule.endTime}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Stack>
        </Grid.Col>

      </Grid>
    </Container>
  );
} 