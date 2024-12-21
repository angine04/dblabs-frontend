import React from 'react';
import { Container, Grid, Card, Text, Group, Avatar, Tabs, Stack, Badge, Timeline, LoadingOverlay } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudents';
import { IconBook, IconCalendar, IconUser, IconNotes } from '@tabler/icons-react';
import { StudentGrades } from '../../components/students/StudentGrades';

export function StudentProfile() {
  const { id } = useParams();
  const { data: student, isLoading } = useStudent(id!);

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!student) {
    return null;
  }

  return (
    <Container size="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="md">
            <Stack align="center" gap="sm">
              <Avatar 
                size={120} 
                radius={120}
                color="blue"
              >
                {student.firstName[0]}{student.lastName[0]}
              </Avatar>
              <Text size="xl" fw={500}>
                {student.firstName} {student.lastName}
              </Text>
              <Badge size="lg" variant="light">
                {student.status}
              </Badge>
              <Text size="sm" c="dimmed">
                Student ID: {student.studentId}
              </Text>
            </Stack>

            <Stack mt="xl">
              <Group>
                <IconUser size={16} />
                <Text size="sm">{student.email}</Text>
              </Group>
              <Group>
                <IconBook size={16} />
                <Text size="sm">{student.program}</Text>
              </Group>
              <Group>
                <IconCalendar size={16} />
                <Text size="sm">
                  Enrolled: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'Not set'}
                </Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder p="md">
            <Tabs defaultValue="academic">
              <Tabs.List>
                <Tabs.Tab value="academic" leftSection={<IconBook size={16} />}>
                  Academic Info
                </Tabs.Tab>
                <Tabs.Tab value="personal" leftSection={<IconUser size={16} />}>
                  Personal Info
                </Tabs.Tab>
                <Tabs.Tab value="activity" leftSection={<IconNotes size={16} />}>
                  Activity Log
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="academic" pt="md">
                <Stack>
                  <StudentGrades 
                    studentId={student.id!}
                    studentName={`${student.firstName} ${student.lastName}`}
                  />
                  <Card withBorder p="sm">
                    <Text fw={500} mb="xs">Current Grade: {student.grade}</Text>
                    <Text size="sm">Program: {student.program}</Text>
                  </Card>

                  <Card withBorder p="sm">
                    <Text fw={500} mb="xs">Course Schedule</Text>
                    <Timeline active={1} bulletSize={24} lineWidth={2}>
                      <Timeline.Item title="Mathematics 101">
                        <Text size="sm">Monday & Wednesday, 9:00 AM</Text>
                      </Timeline.Item>
                      <Timeline.Item title="Physics 201">
                        <Text size="sm">Tuesday & Thursday, 11:00 AM</Text>
                      </Timeline.Item>
                      <Timeline.Item title="Computer Science 301">
                        <Text size="sm">Friday, 2:00 PM</Text>
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="personal" pt="md">
                <Stack>
                  <Card withBorder p="sm">
                    <Text fw={500} mb="xs">Contact Information</Text>
                    <Stack gap="xs">
                      <Text size="sm">Phone: {student.contactNumber}</Text>
                      <Text size="sm">Email: {student.email}</Text>
                    </Stack>
                  </Card>

                  <Card withBorder p="sm">
                    <Text fw={500} mb="xs">Address</Text>
                    <Stack gap="xs">
                      <Text size="sm">{student.address.street}</Text>
                      <Text size="sm">
                        {student.address.city}, {student.address.state} {student.address.zipCode}
                      </Text>
                      <Text size="sm">{student.address.country}</Text>
                    </Stack>
                  </Card>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="activity" pt="md">
                <Timeline active={-1}>
                  <Timeline.Item 
                    title="Grade Updated" 
                    bullet={<IconBook size={12} />}
                  >
                    <Text size="sm">Mathematics 101 grade updated to A</Text>
                    <Text size="xs" c="dimmed">2 days ago</Text>
                  </Timeline.Item>
                  <Timeline.Item 
                    title="Attendance Recorded" 
                    bullet={<IconCalendar size={12} />}
                  >
                    <Text size="sm">Attended Physics 201 lecture</Text>
                    <Text size="xs" c="dimmed">5 days ago</Text>
                  </Timeline.Item>
                </Timeline>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default StudentProfile; 