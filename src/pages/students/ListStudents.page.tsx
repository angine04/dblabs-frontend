import { useNavigate } from 'react-router-dom';
import { Container, Title, Button, Group, Table, TextInput, Select, LoadingOverlay, ActionIcon, Text } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { notifications } from '@mantine/notifications';

export function ListStudents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { 
    students: { data: students, isLoading },
    deleteStudent
  } = useStudents();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent.mutateAsync(id);
        notifications.show({
          title: 'Success',
          message: 'Student deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete student',
          color: 'red',
        });
      }
    }
  };

  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container size="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <Group justify="space-between" mb="md">
        <Title order={2}>Students</Title>
        <Button
          leftSection={<IconPlus size={20} />}
          onClick={() => navigate('/students/add')}
        >
          Add Student
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search students..."
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
            { value: 'graduated', label: 'Graduated' },
          ]}
          style={{ width: 200 }}
          clearable
        />
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Student ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Program</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredStudents?.map((student) => (
            <Table.Tr key={student.id}>
              <Table.Td>{student.studentId}</Table.Td>
              <Table.Td>{`${student.firstName} ${student.lastName}`}</Table.Td>
              <Table.Td>{student.email}</Table.Td>
              <Table.Td>{student.program}</Table.Td>
              <Table.Td>
                <Text tt="capitalize">{student.status}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(student.id!)}
                    loading={deleteStudent.isPending}
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