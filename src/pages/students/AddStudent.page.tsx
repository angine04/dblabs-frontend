import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Group, Select, TextInput, Title, Transition, Paper, Box } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useStudents } from '../../hooks/useStudents';
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react';

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

export function AddStudent() {
  const navigate = useNavigate();
  const { createStudent } = useStudents();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Mount animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path: string) => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate(path);
    }, 300); // Match this with the exit animation duration
  };

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
      student_id: (value) => {
        if (!value) { return 'Please enter a student ID'; }
        if (value.length < 3) { return 'Student ID is too short - should be at least 3 characters'; }
        if (!/^[A-Za-z0-9]+$/.test(value)) { return 'Student ID can only contain English letters and numbers (no spaces or special characters)'; }
        return null;
      },
      first_name: (value) => {
        if (!value) { return 'Please enter a first name'; }
        if (value.length < 2) { return 'First name is too short - should be at least 2 characters'; }
        if (!/^[A-Za-z\s]+$/.test(value)) { return 'First name can only contain English letters and spaces'; }
        return null;
      },
      last_name: (value) => {
        if (!value) { return 'Please enter a last name'; }
        if (value.length < 2) { return 'Last name is too short - should be at least 2 characters'; }
        if (!/^[A-Za-z\s]+$/.test(value)) { return 'Last name can only contain English letters and spaces'; }
        return null;
      },
      email: (value) => {
        if (!value) { return 'Please enter an email address'; }
        if (!/^\S+@\S+\.\S+$/.test(value)) { return 'Please enter a valid email address (e.g., student@university.edu)'; }
        return null;
      },
      date_of_birth: (value) => {
        if (!value) { return 'Please select a date of birth'; }
        const age = new Date().getFullYear() - value.getFullYear();
        if (age < 16) { return 'Student must be at least 16 years old to enroll'; }
        if (age > 100) { return 'Please check the date of birth - age cannot exceed 100 years'; }
        return null;
      },
      enrollment_date: (value) => {
        if (!value) { return 'Please select an enrollment date'; }
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);
        if (value < new Date('2000-01-01')) { return 'Enrollment date cannot be before year 2000'; }
        if (value > sixMonthsFromNow) { return 'Enrollment date cannot be more than 6 months in the future'; }
        return null;
      },
      program: (value) => {
        if (!value) { return 'Please select or enter a program'; }
        if (value.length < 2) { return 'Program name is too short - should be at least 2 characters'; }
        return null;
      },
      status: (value) => {
        if (!value) { return 'Please select a student status'; }
        if (!['active', 'inactive', 'graduated'].includes(value)) { return 'Please select a valid status: Active, Inactive, or Graduated'; }
        return null;
      },
      contact_number: (value) => {
        if (value && !/^\+?[\d\s-]+$/.test(value)) { return 'Phone number can only contain numbers, spaces, hyphens, and an optional + prefix'; }
        return null;
      },
    },
  });

  const handleSubmit = async (values: StudentFormValues) => {
    try {
      // Format dates properly and ensure all fields are in the correct format
      const formattedData = {
        ...values,
        student_id: values.student_id.trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        program: values.program.trim(),
        date_of_birth: values.date_of_birth ? new Date(values.date_of_birth).toISOString().split('T')[0] : undefined,
        enrollment_date: values.enrollment_date ? new Date(values.enrollment_date).toISOString().split('T')[0] : undefined,
        contact_number: values.contact_number?.trim() || undefined,
      };

      // Log the formatted data to help with debugging
      console.log('Sending data to backend:', formattedData);

      await createStudent.mutateAsync(formattedData);
      
      notifications.show({
        title: 'Success',
        message: 'Student added successfully',
        color: 'green',
      });
      handleNavigate('/students');
    } catch (error: any) {
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to add student';
      let errorTitle = 'Unable to Add Student';
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        errorTitle = 'Duplicate Record';
        if (error.response.data?.detail?.includes('student_id')) {
          errorMessage = `A student with ID "${values.student_id}" already exists. Please use a different student ID.`;
        } else if (error.response.data?.detail?.includes('email')) {
          errorMessage = `A student with email "${values.email}" already exists. Please use a different email address.`;
        } else {
          errorMessage = 'This student record already exists in the system. Please check the details and try again.';
        }
      } else if (error.response?.status === 400) {
        errorTitle = 'Invalid Data';
        if (error.response.data?.detail) {
          // Handle specific validation errors
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            // Handle multiple validation errors
            const errors = error.response.data.detail.map((err: any) => {
              const field = err.loc?.[1] || 'field';
              const msg = err.msg || 'is invalid';
              return `${field}: ${msg}`;
            });
            errorMessage = errors.join('\n');
          }
        } else {
          errorMessage = 'Please check your input data and try again. Make sure all required fields are filled correctly.';
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: 'red',
      });
    }
  };

  return (
    <Box
      style={{
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? 'translateX(-20px)' : 'translateX(0)',
        transition: 'all 0.3s ease',
      }}
    >
      <Container size="md">
        <Transition 
          mounted={isVisible} 
          transition="slide-down" 
          duration={400} 
          timingFunction="ease"
        >
          {(styles) => (
            <Title order={2} mb="xl" style={styles}>
              Add New Student
            </Title>
          )}
        </Transition>

        <Transition 
          mounted={isVisible} 
          transition={{
            in: { opacity: 1, transform: 'translateY(0)' },
            out: { opacity: 0, transform: 'translateY(20px)' },
            transitionProperty: 'transform, opacity',
          }}
          duration={400} 
          timingFunction="ease"
        >
          {(styles) => (
            <Paper 
              withBorder 
              shadow="sm" 
              p="xl" 
              style={{
                ...styles,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--mantine-shadow-md)',
                  },
                },
              }}
            >
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Transition 
                  mounted={isVisible} 
                  transition={{
                    in: { opacity: 1, transform: 'translateY(0)' },
                    out: { opacity: 0, transform: 'translateY(20px)' },
                    transitionProperty: 'transform, opacity',
                  }}
                  duration={500} 
                  timingFunction="ease"
                >
                  {(styles) => (
                    <div style={styles}>
                      <TextInput
                        label="Student ID"
                        placeholder="Enter student ID"
                        required
                        {...form.getInputProps('student_id')}
                        mb="md"
                        styles={(theme) => ({
                          root: {
                            transition: 'transform 0.3s ease',
                          },
                          input: {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.colors.blue[4],
                              transform: 'translateX(2px)',
                            },
                            '&:focus': {
                              borderColor: theme.colors.blue[6],
                              transform: 'translateX(5px)',
                            },
                          },
                          wrapper: {
                            '&:has(input:focus)': {
                              transform: 'translateX(5px)',
                            },
                          },
                        })}
                      />

                      <Group grow mb="md">
                        <TextInput
                          label="First Name"
                          placeholder="Enter first name"
                          required
                          {...form.getInputProps('first_name')}
                          styles={(theme) => ({
                            input: {
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                          })}
                        />
                        <TextInput
                          label="Last Name"
                          placeholder="Enter last name"
                          required
                          {...form.getInputProps('last_name')}
                          styles={(theme) => ({
                            input: {
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                          })}
                        />
                      </Group>

                      <TextInput
                        label="Email"
                        placeholder="Enter email"
                        required
                        {...form.getInputProps('email')}
                        mb="md"
                        styles={(theme) => ({
                          input: {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.colors.blue[4],
                              transform: 'translateX(2px)',
                            },
                            '&:focus': {
                              borderColor: theme.colors.blue[6],
                              transform: 'translateX(5px)',
                            },
                          },
                        })}
                      />

                      <Group grow mb="md">
                        <DateInput
                          label="Date of Birth"
                          placeholder="YYYY-MM-DD"
                          valueFormat="YYYY-MM-DD"
                          clearable
                          maxDate={new Date()}
                          {...form.getInputProps('date_of_birth')}
                          styles={(theme) => ({
                            input: {
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                            calendarHeader: {
                              marginBottom: '10px',
                            },
                          })}
                        />
                        <DateInput
                          label="Enrollment Date"
                          placeholder="YYYY-MM-DD"
                          valueFormat="YYYY-MM-DD"
                          clearable
                          {...form.getInputProps('enrollment_date')}
                          styles={(theme) => ({
                            input: {
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                            calendarHeader: {
                              marginBottom: '10px',
                            },
                          })}
                        />
                      </Group>

                      <TextInput
                        label="Program"
                        placeholder="Enter program"
                        required
                        {...form.getInputProps('program')}
                        mb="md"
                        styles={(theme) => ({
                          input: {
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.colors.blue[4],
                              transform: 'translateX(2px)',
                            },
                            '&:focus': {
                              borderColor: theme.colors.blue[6],
                              transform: 'translateX(5px)',
                            },
                          },
                        })}
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
                          styles={(theme) => ({
                            input: {
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                          })}
                        />
                        <TextInput
                          label="Contact Number"
                          placeholder="Enter contact number"
                          {...form.getInputProps('contact_number')}
                          styles={(theme) => ({
                            input: {
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.colors.blue[4],
                                transform: 'translateX(2px)',
                              },
                              '&:focus': {
                                borderColor: theme.colors.blue[6],
                                transform: 'translateX(5px)',
                              },
                            },
                          })}
                        />
                      </Group>

                      <Transition 
                        mounted={isVisible} 
                        transition={{
                          in: { opacity: 1, transform: 'translateY(0)' },
                          out: { opacity: 0, transform: 'translateY(20px)' },
                          transitionProperty: 'transform, opacity',
                          common: { transition: 'all 0.3s ease' }
                        }}
                        duration={600} 
                        timingFunction="ease"
                      >
                        {(styles) => (
                          <Group justify="flex-end" mt="xl" style={styles}>
                            <Button 
                              variant="light" 
                              onClick={() => handleNavigate('/students')}
                              leftSection={<IconArrowLeft size={14} />}
                              styles={{
                                root: {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px) translateX(-2px)',
                                    boxShadow: 'var(--mantine-shadow-sm)',
                                  },
                                  '&:active': {
                                    transform: 'translateY(0) translateX(0)',
                                  },
                                },
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              loading={createStudent.isPending}
                              leftSection={<IconUserPlus size={14} />}
                              styles={{
                                root: {
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: 'var(--mantine-shadow-sm)',
                                  },
                                  '&:active': {
                                    transform: 'translateY(0) scale(1)',
                                  },
                                },
                              }}
                            >
                              Add Student
                            </Button>
                          </Group>
                        )}
                      </Transition>
                    </div>
                  )}
                </Transition>
              </form>
            </Paper>
          )}
        </Transition>
      </Container>
    </Box>
  );
}
