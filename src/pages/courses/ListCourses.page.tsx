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
import { useCourses } from '../../hooks/useCourses';

type SortField = 'code' | 'name' | 'credits' | 'instructor' | 'semester' | 'capacity' | 'status';
type SortDirection = 'asc' | 'desc';

export function ListCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    courses: { data: courses, isLoading },
    deleteCourse,
  } = useCourses();

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
      await deleteCourse.mutateAsync(id.toString());
      notifications.show({
        title: 'Success',
        message: 'Course deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete course',
        color: 'red',
      });
    }
  };

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase()) ||
      course.semester.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || course.status === statusFilter;

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

  const sortedCourses = [...(filteredCourses || [])].sort((a, b) => {
    let aValue, bValue;

    if (sortField === 'credits' || sortField === 'capacity') {
      aValue = Number(a[sortField]);
      bValue = Number(b[sortField]);
    } else {
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
      case 'completed':
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
      await Promise.all(selectedCourses.map((id) => deleteCourse.mutateAsync(id.toString())));
      notifications.show({
        title: 'Success',
        message: 'Courses deleted successfully',
        color: 'green',
      });
      setBulkDeleteModalOpen(false);
      setSelectedCourses([]);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete courses',
        color: 'red',
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === paginatedCourses.length && paginatedCourses.length > 0) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(paginatedCourses.map((course) => Number(course.id)));
    }
  };

  const handleSelectCourse = (id: string) => {
    const numId = Number(id);
    if (selectedCourses.includes(numId)) {
      setSelectedCourses(selectedCourses.filter((courseId) => courseId !== numId));
    } else {
      setSelectedCourses([...selectedCourses, numId]);
    }
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Name', 'Credits', 'Instructor', 'Semester', 'Capacity', 'Status'];
    const data = sortedCourses.map((course) => [
      course.code,
      course.name,
      course.credits,
      course.instructor,
      course.semester,
      course.capacity,
      course.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.map((cell) => `"${cell || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((sortedCourses?.length || 0) / itemsPerPage);

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between" mb="md">
        <Title order={2}>Courses</Title>
        <Group>
          {selectedCourses.length > 0 ? (
            <>
              <Text size="sm" c="dimmed">
                {selectedCourses.length} selected
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
          <Button leftSection={<IconPlus size={20} />} onClick={() => navigate('/courses/add')}>
            Add Course
          </Button>
        </Group>
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
            <Table.Th w={40}>
              <Checkbox
                checked={
                  selectedCourses.length === paginatedCourses.length && paginatedCourses.length > 0
                }
                indeterminate={
                  selectedCourses.length > 0 && selectedCourses.length < sortedCourses.length
                }
                onChange={handleSelectAll}
              />
            </Table.Th>
            <Table.Th onClick={() => handleSort('code')} style={getSortableHeaderStyle('code')}>
              <Group gap="xs" wrap="nowrap">
                Code {getSortIcon('code')}
              </Group>
            </Table.Th>
            <Table.Th onClick={() => handleSort('name')} style={getSortableHeaderStyle('name')}>
              <Group gap="xs" wrap="nowrap">
                Name {getSortIcon('name')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('credits')}
              style={getSortableHeaderStyle('credits')}
            >
              <Group gap="xs" wrap="nowrap">
                Credits {getSortIcon('credits')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('instructor')}
              style={getSortableHeaderStyle('instructor')}
            >
              <Group gap="xs" wrap="nowrap">
                Instructor {getSortIcon('instructor')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('semester')}
              style={getSortableHeaderStyle('semester')}
            >
              <Group gap="xs" wrap="nowrap">
                Semester {getSortIcon('semester')}
              </Group>
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('capacity')}
              style={getSortableHeaderStyle('capacity')}
            >
              <Group gap="xs" wrap="nowrap">
                Capacity {getSortIcon('capacity')}
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
          {paginatedCourses.map((course) => (
            <Table.Tr key={course.id}>
              <Table.Td>
                <Checkbox
                  checked={selectedCourses.includes(Number(course.id))}
                  onChange={() => handleSelectCourse(course.id)}
                />
              </Table.Td>
              <Table.Td>{course.code}</Table.Td>
              <Table.Td>{course.name}</Table.Td>
              <Table.Td>{course.credits}</Table.Td>
              <Table.Td>{course.instructor}</Table.Td>
              <Table.Td>{course.semester}</Table.Td>
              <Table.Td>{course.capacity}</Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(course.status)}>{course.status}</Badge>
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
                    onClick={() => {
                      setCourseToDelete(Number(course.id));
                      setDeleteModalOpen(true);
                    }}
                    loading={deleteCourse.isPending && courseToDelete === Number(course.id)}
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
        <p>Are you sure you want to delete this course?</p>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => courseToDelete && handleDelete(courseToDelete)}
            loading={deleteCourse.isPending}
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
        <p>Are you sure you want to delete {selectedCourses.length} courses?</p>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setBulkDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleBulkDelete} loading={deleteCourse.isPending}>
            Delete All
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
