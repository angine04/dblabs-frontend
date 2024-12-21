import React from 'react';
import { Container, Title, Space, LoadingOverlay, Alert } from '@mantine/core';
import { StudentForm } from '../../components/students/StudentForm';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudent, useStudents } from '../../hooks/useStudents';
import { IconAlertCircle } from '@tabler/icons-react';

export function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: student, isLoading, error } = useStudent(id!);
  const { updateStudent } = useStudents();

  const handleSubmit = async (values: any) => {
    try {
      await updateStudent.mutateAsync({ id: id!, data: values });
      notifications.show({
        title: 'Success',
        message: 'Student updated successfully',
        color: 'green',
      });
      navigate('/students');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update student',
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
        >
          Failed to load student data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Title order={2}>Edit Student</Title>
      <Space h="md" />
      {student && (
        <StudentForm 
          initialValues={student}
          onSubmit={handleSubmit}
          isLoading={updateStudent.isPending}
        />
      )}
    </Container>
  );
} 