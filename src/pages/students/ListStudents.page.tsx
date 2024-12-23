import React, { useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconEdit,
  IconFileExport,
  IconPlus,
  IconSearch,
  IconSelector,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
  MantineTheme,
  Menu,
  Modal,
  Pagination,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useStudents } from '../../hooks/useStudents';

type SortField =
  | 'student_id'
  | 'name'
  | 'email'
  | 'date_of_birth'
  | 'enrollment_date'
  | 'program'
  | 'status';
type SortDirection = 'asc' | 'desc';

export function ListStudents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('student_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    students: { data: students, isLoading },
    deleteStudent,
  } = useStudents();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <IconSelector size={16} stroke={1.5} style={{ opacity: 0.5 }} />;
    }
    return sortDirection === 'asc' ? (
      <IconChevronUp size={16} stroke={1.5} />
    ) : (
      <IconChevronDown size={16} stroke={1.5} />
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent.mutateAsync(id.toString());
      notifications.show({
        title: 'Success',
        message: 'Student deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete student',
        color: 'red',
      });
    }
  };

  const filteredStudents = students?.filter((student) => {
    const matchesSearch =
      student.student_id.toLowerCase().includes(search.toLowerCase()) ||
      student.first_name.toLowerCase().includes(search.toLowerCase()) ||
      student.last_name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.program.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const compareValues = (aVal: any, bVal: any): number => {
    if (aVal === null || aVal === undefined) {
      return 1;
    }
    if (bVal === null || bVal === undefined) {
      return -1;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }

    if (aVal < bVal) {
      return -1;
    }
    if (aVal > bVal) {
      return 1;
    }
    return 0;
  };

  const sortedStudents = [...(filteredStudents || [])].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = `${a.last_name} ${a.first_name}`.toLowerCase();
        bValue = `${b.last_name} ${b.first_name}`.toLowerCase();
        break;
      case 'date_of_birth':
      case 'enrollment_date':
        aValue = a[sortField] ? new Date(a[sortField]).getTime() : null;
        bValue = b[sortField] ? new Date(b[sortField]).getTime() : null;
        break;
      default:
        aValue = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
        bValue = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    }

    const compareResult = compareValues(aValue, bValue);
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'graduated':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getSortableHeaderStyle = (_field: SortField) => ({
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: (theme: MantineTheme) => theme.colors.gray[0],
    },
  });

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedStudents.map((id) => deleteStudent.mutateAsync(id.toString())));
      notifications.show({
        title: 'Success',
        message: 'Students deleted successfully',
        color: 'green',
      });
      setBulkDeleteModalOpen(false);
      setSelectedStudents([]);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete students',
        color: 'red',
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((student) => student.id));
    }
  };

  const handleSelectStudent = (id: number) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Student ID',
      'First Name',
      'Last Name',
      'Email',
      'Program',
      'Status',
      'Date of Birth',
      'Enrollment Date',
    ];
    const data = sortedStudents.map((student) => [
      student.student_id,
      student.first_name,
      student.last_name,
      student.email,
      student.program,
      student.status,
      student.date_of_birth,
      student.enrollment_date,
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.map((cell) => `"${cell || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((sortedStudents?.length || 0) / itemsPerPage);

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between" mb="md">
        <Title order={2}>Students</Title>
        <Group>
          {selectedStudents.length > 0 ? (
            <>
              <Text size="sm" c="dimmed">
                {selectedStudents.length} selected
              </Text>
              <Button variant="light" color="red" onClick={() => setBulkDeleteModalOpen(true)}>
                Delete Selected
              </Button>
            </>
          ) : (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button variant="light" leftSection={<IconDownload size={20} />}>
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconFileExport size={14} />} onClick={exportToCSV}>
                  Export to CSV
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <Button leftSection={<IconPlus size={20} />} onClick={() => navigate('/students/add')}>
            Add Student
          </Button>
        </Group>
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
            <Table.Th w={40}>
              <Checkbox
                checked={
                  selectedStudents.length === paginatedStudents.length &&
                  paginatedStudents.length > 0
                }
                indeterminate={
                  selectedStudents.length > 0 && selectedStudents.length < sortedStudents.length
                }
                onChange={handleSelectAll}
              />
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('student_id')}
              style={getSortableHeaderStyle('student_id')}
            >
              <Group gap="xs" wrap="nowrap">
                Student ID {getSortIcon('student_id')}
              </Group>
            </Table.Th>
            <Table.Th onClick={() => handleSort('name')} style={getSortableHeaderStyle('name')}>
              <Group gap="xs" wrap="nowrap">
                Name {getSortIcon('name')}
              </Group>
            </Table.Th>
            <Table.Th onClick={() => handleSort('email')} style={getSortableHeaderStyle('email')}>
              <Group gap="xs" wrap="nowrap">
                Email {getSortIcon('email')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('date_of_birth')}
              style={getSortableHeaderStyle('date_of_birth')}
            >
              <Group gap="xs" wrap="nowrap">
                Date of Birth {getSortIcon('date_of_birth')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('program')}
              style={getSortableHeaderStyle('program')}
            >
              <Group gap="xs" wrap="nowrap">
                Program {getSortIcon('program')}
              </Group>
            </Table.Th>
            <Table.Th onClick={() => handleSort('status')} style={getSortableHeaderStyle('status')}>
              <Group gap="xs" wrap="nowrap">
                Status {getSortIcon('status')}
              </Group>
            </Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedStudents.map((student) => (
            <Table.Tr key={student.id}>
              <Table.Td>
                <Checkbox
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleSelectStudent(student.id)}
                />
              </Table.Td>
              <Table.Td>{student.student_id}</Table.Td>
              <Table.Td>
                {student.first_name} {student.last_name}
              </Table.Td>
              <Table.Td>{student.email}</Table.Td>
              <Table.Td>{student.date_of_birth}</Table.Td>
              <Table.Td>{student.program}</Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(student.status)}>{student.status}</Badge>
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
                    onClick={() => {
                      setStudentToDelete(student.id);
                      setDeleteModalOpen(true);
                    }}
                    loading={deleteStudent.isPending && studentToDelete === student.id}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="sm" />
        </Group>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        centered
      >
        <p>Are you sure you want to delete this student?</p>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => studentToDelete && handleDelete(studentToDelete)}
            loading={deleteStudent.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Confirm Bulk Deletion"
        centered
      >
        <p>Are you sure you want to delete {selectedStudents.length} students?</p>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setBulkDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleBulkDelete} loading={deleteStudent.isPending}>
            Delete All
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
