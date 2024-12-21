import { useNavigate } from 'react-router-dom';
import { Container, Title, Button, Group, Table, Badge, ActionIcon, TextInput, Select, LoadingOverlay } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { notifications } from '@mantine/notifications';
import { Course } from '../../types/course';

export function ListCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { 
    courses: { data: courses, isLoading },
    deleteCourse
  } = useCourses();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'Course deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete course',
          color: 'red',
        });
      }
    }
  };

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <Group justify="space-between" mb="md">
        <Title order={2}>Courses</Title>
        <Button
          leftSection={<IconPlus size={20} />}
          onClick={() => navigate('/courses/add')}
        >
          Add Course
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search courses..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={{ width: 200 }}
          clearable
        />
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Code</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Instructor</Table.Th>
            <Table.Th>Credits</Table.Th>
            <Table.Th>Semester</Table.Th>
            <Table.Th>Capacity</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredCourses?.map((course) => (
            <Table.Tr key={course.id}>
              <Table.Td>{course.code}</Table.Td>
              <Table.Td>{course.name}</Table.Td>
              <Table.Td>{course.instructor}</Table.Td>
              <Table.Td>{course.credits}</Table.Td>
              <Table.Td>{course.semester}</Table.Td>
              <Table.Td>
                {course.enrolledCount || 0}/{course.capacity}
              </Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(course.id!)}
                    loading={deleteCourse.isPending}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
} 