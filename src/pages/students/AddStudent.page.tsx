import React from 'react';
import { Container, Title, Space } from '@mantine/core';
import { StudentForm } from '../../components/students/StudentForm';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../../hooks/useStudents';

export function AddStudent() {
  const navigate = useNavigate();
  const { createStudent } = useStudents();

  const handleSubmit = async (values: any) => {
    try {
      await createStudent.mutateAsync(values);
      notifications.show({
        title: 'Success',
        message: 'Student created successfully',
        color: 'green',
      });
      navigate('/students');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create student',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl">
      <Title order={2}>Add New Student</Title>
      <Space h="md" />
      <StudentForm 
        onSubmit={handleSubmit} 
        isLoading={createStudent.isPending}
      />
    </Container>
  );
} 