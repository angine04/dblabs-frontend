import React from 'react';
import { TextInput, Select, Grid, Button, Group, Card, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Student } from '../../types/student';

interface StudentFormProps {
  initialValues?: Partial<Student>;
  onSubmit: (values: Partial<Student>) => void;
  isLoading?: boolean;
}

export function StudentForm({ initialValues, onSubmit, isLoading }: StudentFormProps) {
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: null,
      studentId: '',
      enrollmentDate: null,
      grade: '',
      program: '',
      status: 'active',
      contactNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      ...initialValues,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      firstName: (value) => (value.length < 2 ? 'First name is too short' : null),
      lastName: (value) => (value.length < 2 ? 'Last name is too short' : null),
      studentId: (value) => (value.length < 1 ? 'Student ID is required' : null),
    },
  });

  return (
    <Card withBorder radius="md" p="md">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                required
                label="First Name"
                placeholder="Enter first name"
                {...form.getInputProps('firstName')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                required
                label="Last Name"
                placeholder="Enter last name"
                {...form.getInputProps('lastName')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                required
                label="Email"
                placeholder="Enter email"
                {...form.getInputProps('email')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                required
                label="Student ID"
                placeholder="Enter student ID"
                {...form.getInputProps('studentId')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Date of Birth"
                placeholder="Select date"
                {...form.getInputProps('dateOfBirth')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Enrollment Date"
                placeholder="Select date"
                {...form.getInputProps('enrollmentDate')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Program"
                placeholder="Select program"
                data={[
                  { value: 'computer_science', label: 'Computer Science' },
                  { value: 'engineering', label: 'Engineering' },
                  { value: 'business', label: 'Business' },
                  { value: 'arts', label: 'Arts' },
                ]}
                {...form.getInputProps('program')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Status"
                placeholder="Select status"
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'graduated', label: 'Graduated' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
                {...form.getInputProps('status')}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Contact Number"
            placeholder="Enter contact number"
            {...form.getInputProps('contactNumber')}
          />

          <Stack gap="xs">
            <TextInput
              label="Street Address"
              placeholder="Enter street address"
              {...form.getInputProps('address.street')}
            />
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="City"
                  placeholder="Enter city"
                  {...form.getInputProps('address.city')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="State"
                  placeholder="Enter state"
                  {...form.getInputProps('address.state')}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Zip Code"
                  placeholder="Enter zip code"
                  {...form.getInputProps('address.zipCode')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Country"
                  placeholder="Enter country"
                  {...form.getInputProps('address.country')}
                />
              </Grid.Col>
            </Grid>
          </Stack>

          <Group justify="flex-end">
            <Button type="submit" loading={isLoading}>
              {initialValues ? 'Update Student' : 'Add Student'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
} 