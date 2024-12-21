import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Title, Button, Group, TextInput, Select, LoadingOverlay } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import '@mantine/dates/styles.css'
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useStudents } from '../../hooks/useStudents';

interface StudentFormValues {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: Date | null;
  enrollment_date: Date | null;
  program: string;
  status: string;
  contact_number: string;
}

export function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    updateStudent,
    students: { data: students, isLoading }
  } = useStudents();

  const student = students?.find(s => s.id === Number(id));

  const form = useForm<StudentFormValues>({
    initialValues: {
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: null,
      enrollment_date: null,
      program: '',
      status: 'active',
      contact_number: '',
    },
    validate: {
      student_id: (value) => (!value ? 'Student ID is required' : null),
      first_name: (value) => (!value ? 'First name is required' : null),
      last_name: (value) => (!value ? 'Last name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      program: (value) => (!value ? 'Program is required' : null),
      status: (value) => (!value ? 'Status is required' : null),
    },
  });

  useEffect(() => {
    if (student) {
      form.setValues({
        ...student,
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth) : null,
        enrollment_date: student.enrollment_date ? new Date(student.enrollment_date) : null,
      });
    }
  }, [student]);

  const handleSubmit = async (values: StudentFormValues) => {
    if (!id) {
      return;
    }
    
    try {
      await updateStudent.mutateAsync({
        id,
        data: {
          student_id: values.student_id,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          date_of_birth: values.date_of_birth?.toISOString().split('T')[0],
          enrollment_date: values.enrollment_date?.toISOString().split('T')[0],
          program: values.program,
          status: values.status,
          contact_number: values.contact_number
        }
      });
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

  if (!student && !isLoading) {
    return (
      <Container size="md">
        <Title order={2} mb="xl">Student Not Found</Title>
        <Button onClick={() => navigate('/students')}>Back to Students</Button>
      </Container>
    );
  }

  return (
    <Container size="md" pos="relative">
      <LoadingOverlay visible={isLoading} />
      
      <Title order={2} mb="xl">Edit Student</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Student ID"
          placeholder="Enter student ID"
          required
          {...form.getInputProps('student_id')}
          mb="md"
        />

        <Group grow mb="md">
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            required
            {...form.getInputProps('first_name')}
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            required
            {...form.getInputProps('last_name')}
          />
        </Group>

        <TextInput
          label="Email"
          placeholder="Enter email"
          required
          {...form.getInputProps('email')}
          mb="md"
        />

        <Group grow mb="md">
          <DateInput
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            valueFormat="YYYY-MM-DD"
            clearable
            maxDate={new Date()}
            {...form.getInputProps('date_of_birth')}
            styles={{
              input: {
                fontSize: '14px'
              },
              calendarHeader: {
                marginBottom: '10px'
              }
            }}
          />
          <DateInput
            label="Enrollment Date"
            placeholder="YYYY-MM-DD"
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps('enrollment_date')}
            styles={{
              input: {
                fontSize: '14px'
              },
              calendarHeader: {
                marginBottom: '10px'
              }
            }}
          />
        </Group>

        <TextInput
          label="Program"
          placeholder="Enter program"
          required
          {...form.getInputProps('program')}
          mb="md"
        />

        <Group grow mb="md">
          <Select
            label="Status"
            placeholder="Select status"
            required
            data={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'graduated', label: 'Graduated' },
            ]}
            {...form.getInputProps('status')}
          />
          <TextInput
            label="Contact Number"
            placeholder="Enter contact number"
            {...form.getInputProps('contact_number')}
          />
        </Group>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={() => navigate('/students')}>
            Cancel
          </Button>
          <Button type="submit" loading={updateStudent.isPending}>
            Save Changes
          </Button>
        </Group>
      </form>
    </Container>
  );
}
