import React, { useState } from 'react';
import { Container, Grid, Card, Text, Group, Button, Table, ActionIcon, Select, Badge, Menu } from '@mantine/core';
import { IconDownload, IconFilter, IconEdit, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeApi } from '../../services/api';
import { useCourses } from '../../hooks/useCourses';
import { Grade } from '../../types/course';
import { GradeEditModal } from '../../components/grades/GradeEditModal';

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

  const { courses: { data: courses = [] } } = useCourses();

  // Get unique semesters from courses and sort them
  const availableSemesters = React.useMemo(() => {
    const semesters = new Set(courses.map(course => course.semester));
    return Array.from(semesters)
      .sort()
      .map(semester => ({
        value: semester,
        label: semester
      }));
  }, [courses]);

  // Sort courses by code
  const sortedCourses = React.useMemo(() => {
    return [...courses]
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(course => ({
        value: course.id.toString(),
        label: `${course.code} - ${course.name}`
      }));
  }, [courses]);

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades', 'course', selectedCourse],
    queryFn: () => selectedCourse ? gradeApi.getByCourse(selectedCourse) : Promise.resolve([]),
    enabled: !!selectedCourse
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Grade> }) =>
      gradeApi.update(id, data),
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
    }
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
    }
  });

  const handleGradeSubmit = async (values: GradeFormValues) => {
    if (!selectedStudent?.id) {
      return;
    }

    await updateGradeMutation.mutateAsync({
      id: selectedStudent.id,
      data: {
        score: values.score,
        comments: values.comments
      }
    });
  };

  const handleAddGrade = async (values: GradeFormValues & { student_id?: string }) => {
    if (!selectedCourse || !values.student_id) return;

    const selectedCourseObj = courses.find(c => c.id.toString() === selectedCourse);
    if (!selectedCourseObj) return;

    await createGradeMutation.mutateAsync({
      course_id: parseInt(selectedCourse, 10),
      student_id: parseInt(values.student_id, 10),
      score: values.score,
      comments: values.comments,
      submission_date: new Date().toISOString(),
      semester: selectedCourseObj.semester
    });
    setEditModalOpen(false);
    setSelectedStudent(null);
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'green';
      case 'B': return 'blue';
      case 'C': return 'yellow';
      case 'D': return 'orange';
      case 'F': return 'red';
      default: return 'gray';
    }
  };

  const filteredGrades = selectedSemester
    ? grades.filter(grade => grade.semester === selectedSemester)
    : grades;

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700}>Grade Management</Text>
        <Group>
          <Button
            variant="light"
            leftSection={<IconDownload size={20} />}
          >
            Export Grades
          </Button>
          <Button
            leftSection={<IconFilter size={20} />}
          >
            Advanced Filters
          </Button>
        </Group>
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
                      <Table.Td>{grade.student?.studentId}</Table.Td>
                      <Table.Td>
                        {grade.student?.firstName} {grade.student?.lastName}
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
                      <Table.Td colSpan={6} align="center">
                        {selectedCourse ? 'No grades available' : 'Please select a course'}
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
        studentData={selectedStudent ? {
          studentName: `${selectedStudent.student?.firstName} ${selectedStudent.student?.lastName}`,
          grades: selectedStudent
        } : {
          studentName: 'New Grade',
          grades: {
            id: '',
            score: 0,
            comments: '',
            student_id: 0,
            course_id: 0,
            submission_date: new Date().toISOString(),
            semester: selectedCourse ? courses.find(c => c.id.toString() === selectedCourse)?.semester || '' : ''
          }
        }}
        onSubmit={selectedStudent ? handleGradeSubmit : handleAddGrade}
        isNew={!selectedStudent}
      />
    </Container>
  );
} 