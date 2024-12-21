import { useNavigate, useParams } from 'react-router-dom';
import { Container, Title, Button, Group, LoadingOverlay, Space, Alert } from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCourse, useCourses } from '../../hooks/useCourses';
import { CourseForm } from '../../components/courses/CourseForm';
import { Course } from '../../types/course';

export function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useCourse(id!);
  const { updateCourse } = useCourses();

  const handleSubmit = async (values: Partial<Course>) => {
    try {
      await updateCourse.mutateAsync({ id: id!, data: values });
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

  if (error) {
    return (
      <Container size="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          Failed to load course details
        </Alert>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <Group justify="space-between" mb="md">
        <Title order={2}>Edit Course</Title>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </Button>
      </Group>

      <Space h="md" />
      
      {course && (
        <CourseForm 
          initialValues={course}
          onSubmit={handleSubmit}
          isLoading={updateCourse.isPending}
        />
      )}
    </Container>
  );
} 