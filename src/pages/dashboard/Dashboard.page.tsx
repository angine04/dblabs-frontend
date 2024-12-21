import React from 'react';
import { Container, Grid, Card, Text, Group, LoadingOverlay } from '@mantine/core';
import { IconUsers, IconSchool, IconBooks, IconChartBar } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStats } from '../../hooks/useStats';

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
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container size="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Total Students"
            value={stats?.total_students}
            icon={IconUsers}
            color="blue"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Active Students"
            value={stats?.active_students}
            icon={IconBooks}
            color="green"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Graduated"
            value={stats?.graduated_students}
            icon={IconSchool}
            color="grape"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <StatsCard
            title="Average GPA"
            value={stats?.average_gpa}
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
                  data={stats?.program_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: { name: string; value: number }) => entry.name}
                >
                  {stats?.program_distribution.map((entry, index) => (
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
            <Text fw={500} mb="md">GPA Distribution</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.gpa_distribution} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range"
                  label={{ value: 'GPA Range', position: 'bottom' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Number of Students', angle: -90, position: 'left' }}
                />
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