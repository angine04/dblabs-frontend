import React, { useEffect, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Container,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Table,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCourses } from '../../hooks/useCourses';
import { Course } from '../../types/course';

type CourseFormValues = Omit<Course, 'id' | 'enrolled_count' | 'created_at' | 'updated_at'>;

export function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    updateCourse,
    courses: { data: courses, isLoading },
  } = useCourses();
  const [schedule, setSchedule] = useState<Course['schedule']>([]);

  const course = courses?.find((c) => String(c.id) === id);

  const form = useForm<CourseFormValues>({
    initialValues: {
      code: '',
      name: '',
      description: '',
      credits: 3,
      instructor: '',
      semester: '',
      capacity: 30,
      status: 'active',
      schedule: [],
    },
    validate: {
      code: (value) => (!value ? 'Course code is required' : null),
      name: (value) => (!value ? 'Course name is required' : null),
      credits: (value) => (value <= 0 ? 'Credits must be greater than 0' : null),
      instructor: (value) => (!value ? 'Instructor name is required' : null),
      semester: (value) => (!value ? 'Semester is required' : null),
      capacity: (value) => (value <= 0 ? 'Capacity must be greater than 0' : null),
      status: (value) => (!value ? 'Status is required' : null),
    },
  });

  useEffect(() => {
    if (course) {
      form.setValues({
        code: course.code,
        name: course.name,
        description: course.description || '',
        credits: course.credits,
        instructor: course.instructor,
        semester: course.semester,
        capacity: course.capacity,
        status: course.status,
        schedule: [],
      });

      setSchedule(course.schedule || []);
    }
  }, [course]);

  const handleSubmit = async (values: Omit<CourseFormValues, 'schedule'>) => {
    if (!id) {
      return;
    }

    try {
      await updateCourse.mutateAsync({
        id,
        data: {
          ...values,
          schedule,
        },
      });
      notifications.show({
        title: 'Success',
        message: 'Course updated successfully',
        color: 'green',
      });
      navigate('/courses');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update course',
        color: 'red',
      });
    }
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { day: '', start_time: '', end_time: '' }]);
  };

  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleItem = (index: number, field: keyof Course['schedule'][0], value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  if (!course && !isLoading) {
    return (
      <Container size="md">
        <Title order={2} mb="xl">
          Course Not Found
        </Title>
        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
      </Container>
    );
  }

  return (
    <Container size="md" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Title order={2} mb="xl">
        Edit Course
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group grow mb="md">
          <TextInput
            label="Course Code"
            placeholder="e.g., CS101"
            required
            {...form.getInputProps('code')}
          />
          <TextInput
            label="Course Name"
            placeholder="Enter course name"
            required
            {...form.getInputProps('name')}
          />
        </Group>

        <Textarea
          label="Description"
          placeholder="Enter course description"
          minRows={3}
          {...form.getInputProps('description')}
          mb="md"
        />

        <Group grow mb="md">
          <NumberInput
            label="Credits"
            placeholder="Enter credits"
            required
            min={0}
            {...form.getInputProps('credits')}
          />
          <TextInput
            label="Instructor"
            placeholder="Enter instructor name"
            required
            {...form.getInputProps('instructor')}
          />
        </Group>

        <Group grow mb="md">
          <Select
            label="Semester"
            placeholder="Select semester"
            required
            data={[
              { value: 'Fall 2023', label: 'Fall 2023' },
              { value: 'Spring 2024', label: 'Spring 2024' },
              { value: 'Summer 2024', label: 'Summer 2024' },
              { value: 'Fall 2024', label: 'Fall 2024' },
            ]}
            {...form.getInputProps('semester')}
          />
          <NumberInput
            label="Capacity"
            placeholder="Enter capacity"
            required
            min={1}
            {...form.getInputProps('capacity')}
          />
        </Group>

        <Select
          label="Status"
          placeholder="Select status"
          required
          data={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'completed', label: 'Completed' },
          ]}
          {...form.getInputProps('status')}
          mb="md"
        />

        <Title order={4} mb="md">
          Course Schedule
        </Title>
        <Table mb="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Start Time</Table.Th>
              <Table.Th>End Time</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {schedule.map((item, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Select
                    value={item.day}
                    onChange={(value) => updateScheduleItem(index, 'day', value || '')}
                    data={[
                      { value: 'Monday', label: 'Monday' },
                      { value: 'Tuesday', label: 'Tuesday' },
                      { value: 'Wednesday', label: 'Wednesday' },
                      { value: 'Thursday', label: 'Thursday' },
                      { value: 'Friday', label: 'Friday' },
                    ]}
                    required
                  />
                </Table.Td>
                <Table.Td>
                  <TimeInput
                    value={item.start_time}
                    onChange={(event) =>
                      updateScheduleItem(index, 'start_time', event.currentTarget.value)
                    }
                    required
                  />
                </Table.Td>
                <Table.Td>
                  <TimeInput
                    value={item.end_time}
                    onChange={(event) =>
                      updateScheduleItem(index, 'end_time', event.currentTarget.value)
                    }
                    required
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon variant="light" color="red" onClick={() => removeScheduleItem(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Button
          variant="light"
          onClick={addScheduleItem}
          leftSection={<IconPlus size={16} />}
          mb="xl"
        >
          Add Schedule
        </Button>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={() => navigate('/courses')}>
            Cancel
          </Button>
          <Button type="submit" loading={updateCourse.isPending}>
            Save Changes
          </Button>
        </Group>
      </form>
    </Container>
  );
}
