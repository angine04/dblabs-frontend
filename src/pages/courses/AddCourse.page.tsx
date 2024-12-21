import { useNavigate } from 'react-router-dom';
import { Container, Title, Button, Group, Space } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCourses } from '../../hooks/useCourses';
import { CourseForm } from '../../components/courses/CourseForm';
import { Course } from '../../types/course';

export function AddCourse() {
  const navigate = useNavigate();
  const { createCourse } = useCourses();

  const handleSubmit = async (values: Omit<Course, 'id'>) => {
    try {
      await createCourse.mutateAsync(values);
      notifications.show({
        title: 'Success',
        message: 'Course created successfully',
        color: 'green',
      });
      navigate('/courses');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create course',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Add New Course</Title>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </Button>
      </Group>

      <Space h="md" />
      
      <CourseForm 
        onSubmit={handleSubmit}
        isLoading={createCourse.isPending}
      />
    </Container>
  );
} 