import React, { useState, useMemo, useEffect } from 'react';
import { IconEdit, IconPlus, IconSchool } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Select,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { GradeEditModal } from '../../components/grades/GradeEditModal';
import { useCourses } from '../../hooks/useCourses';
import { gradeApi } from '../../services/api';
import { Grade } from '../../types/grade';

interface GradeFormValues {
  score: number;
  comments?: string;
}

export function GradeManagement() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Grade | null>(null);
  const queryClient = useQueryClient();

  const {
    courses: { data: courses = [] },
  } = useCourses();

  // Get available semesters for the current course
  const availableSemesters = useMemo(() => {
    if (!selectedCourse) {return [];}

    const currentCourse = courses.find(c => c.id.toString() === selectedCourse);
    if (!currentCourse) {return [];}

    // Get all courses with the same code
    const relatedCourses = courses.filter(c => c.code === currentCourse.code);
    
    // Get unique semesters from related courses
    const semesters = [...new Set(relatedCourses.map(c => c.semester))];
    
    return semesters
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order
      .map(semester => ({
        value: semester,
        label: semester,
      }));
  }, [selectedCourse, courses]);

  // Reset semester selection when course changes
  useEffect(() => {
    setSelectedSemester(null);
  }, [selectedCourse]);

  // Sort courses by code
  const sortedCourses = React.useMemo(() => {
    return [...courses]
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((course) => ({
        value: course.id.toString(),
        label: `${course.code} - ${course.name}`,
      }));
  }, [courses]);

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades', 'course', selectedCourse],
    queryFn: () => (selectedCourse ? gradeApi.getByCourse(selectedCourse) : Promise.resolve([])),
    enabled: !!selectedCourse,
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Grade> }) => gradeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', 'course', selectedCourse] });
      setEditModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Grades updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update grades',
        color: 'red',
      });
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: (data: Omit<Grade, 'id'>) => gradeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', 'course', selectedCourse] });
      notifications.show({
        title: 'Success',
        message: 'Grade added successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to add grade',
        color: 'red',
      });
    },
  });

  const handleGradeSubmit = async (values: GradeFormValues) => {
    if (!selectedStudent?.id) {
      return;
    }

    await updateGradeMutation.mutateAsync({
      id: selectedStudent.id,
      data: {
        score: values.score,
        comments: values.comments,
      },
    });
  };

  const handleAddGrade = async (values: GradeFormValues & { student_id?: string }) => {
    if (!selectedCourse || !values.student_id) {
      return;
    }

    const selectedCourseObj = courses.find((c) => c.id.toString() === selectedCourse);
    if (!selectedCourseObj) {
      return;
    }

    await createGradeMutation.mutateAsync({
      course_id: parseInt(selectedCourse, 10),
      student_id: parseInt(values.student_id, 10),
      score: values.score,
      comments: values.comments,
      submission_date: new Date().toISOString(),
      semester: selectedCourseObj.semester,
    });
    setEditModalOpen(false);
    setSelectedStudent(null);
  };

  const getLetterGrade = (score: number | null): string => {
    if (score === null) {
      return '-';
    }
    if (score >= 90) {
      return 'A';
    }
    if (score >= 80) {
      return 'B';
    }
    if (score >= 70) {
      return 'C';
    }
    if (score >= 60) {
      return 'D';
    }
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A':
        return 'green';
      case 'B':
        return 'blue';
      case 'C':
        return 'yellow';
      case 'D':
        return 'orange';
      case 'F':
        return 'red';
      case '-':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const filteredGrades = selectedSemester
    ? grades.filter((grade) => grade.semester === selectedSemester)
    : grades;

  return (
    <Container size="lg">
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700}>
          Grade Management
        </Text>
      </Group>
      <Grid>
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Group mb="md">
              <Select
                placeholder="Select Course"
                value={selectedCourse}
                onChange={setSelectedCourse}
                data={sortedCourses}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Select Semester"
                value={selectedSemester}
                onChange={setSelectedSemester}
                data={availableSemesters}
                style={{ width: 200 }}
                clearable
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setSelectedStudent(null);
                  setEditModalOpen(true);
                }}
                disabled={!selectedCourse}
              >
                Add Grade
              </Button>
            </Group>

            {isLoading ? (
              <Text>Loading grades...</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student ID</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredGrades.map((grade) => (
                    <Table.Tr key={grade.id}>
                      <Table.Td>{grade.student?.student_id}</Table.Td>
                      <Table.Td>
                        {grade.student?.first_name} {grade.student?.last_name}
                      </Table.Td>
                      <Table.Td>{grade.score}</Table.Td>
                      <Table.Td>
                        <Badge color={getGradeColor(getLetterGrade(grade.score))}>
                          {getLetterGrade(grade.score)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{grade.semester}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => {
                            setSelectedStudent(grade);
                            setEditModalOpen(true);
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {(!filteredGrades || filteredGrades.length === 0) && (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Center py="xl">
                          <Stack align="center" gap="md">
                            <ThemeIcon size="xl" radius="xl" color="blue">
                              <IconSchool size={28} />
                            </ThemeIcon>
                            <Text size="xl" fw={500}>
                              {selectedCourse
                                ? 'No grades available'
                                : 'Please select a course to view grades'}
                            </Text>
                            {!selectedCourse && (
                              <Text c="dimmed" size="sm">
                                Use the dropdown above to choose a course and manage its grades
                              </Text>
                            )}
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <GradeEditModal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStudent(null);
        }}
        studentData={
          selectedStudent
            ? {
                studentName: `${selectedStudent.student?.first_name} ${selectedStudent.student?.last_name}`,
                grades: selectedStudent,
              }
            : {
                studentName: 'New Grade',
                grades: {
                  id: '',
                  score: 0,
                  comments: '',
                  student_id: 0,
                  course_id: 0,
                  submission_date: new Date().toISOString(),
                  semester: selectedCourse
                    ? courses.find((c) => c.id.toString() === selectedCourse)?.semester || ''
                    : '',
                },
              }
        }
        onSubmit={selectedStudent ? handleGradeSubmit : handleAddGrade}
        isNew={!selectedStudent}
      />
    </Container>
  );
}
