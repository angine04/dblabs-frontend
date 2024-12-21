import React from 'react';
import { Container, Grid, Card, Text, Group, Stack } from '@mantine/core';
import { IconUsers, IconSchool, IconBooks, IconChartBar } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStudents } from '../../hooks/useStudents';

const COLORS = ['#1c7ed6', '#37b24d', '#f03e3e', '#7950f2'];

const StatsCard = ({ title, value, icon: Icon, color }: any) => (
  <Card withBorder p="md">
    <Group>
      <Icon size={30} style={{ color: `var(--mantine-color-${color}-6)` }} />
      <div>
        <Text size="xs" c="dimmed">
          {title}
        </Text>
        <Text fw={700} size="xl">
          {value}
        </Text>
      </div>
    </Group>
  </Card>
);

export function Dashboard() {
  const { students } = useStudents();

  const programData = students.data?.reduce((acc, student) => {
    acc[student.program] = (acc[student.program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(programData || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const gradeData = [
    { grade: 'A', count: 30 },
    { grade: 'B', count: 45 },
    { grade: 'C', count: 20 },
    { grade: 'D', count: 5 },
  ];

  return (
    <Container size="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Total Students"
            value="1,234"
            icon={IconUsers}
            color="blue"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Active Students"
            value="1,089"
            icon={IconBooks}
            color="green"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Graduated"
            value="145"
            icon={IconSchool}
            color="grape"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Average GPA"
            value="3.5"
            icon={IconChartBar}
            color="orange"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h={400}>
            <Text fw={500} mb="md">Program Distribution</Text>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: { name: string; value: number }) => entry.name}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md" h={400}>
            <Text fw={500} mb="md">Grade Distribution</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1c7ed6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

      </Grid>
    </Container>
  );
} 