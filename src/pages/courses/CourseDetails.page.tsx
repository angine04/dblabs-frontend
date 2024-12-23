import React, { useState } from 'react';
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Table,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCourses } from '../../hooks/useCourses';
import { api } from '../../services/api';

interface EditingScore {
  gradeId: number;
  score: number;
}

interface Grade {
  id: number;
  student_id: number;
  score: number | null;
  student?: {
    student_id: string;
    first_name: string;
    last_name: string;
  };
}

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<EditingScore | null>(null);

  const {
    courses: { data: courses, isLoading: coursesLoading },
  } = useCourses();
  const course = courses?.find((c) => String(c.id) === id);

  // Fetch all students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students/');
      return response.data;
    },
  });

  // Fetch course grades (enrolled students)
  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', 'course', id],
    queryFn: async () => {
      const response = await api.get(`/grades/course/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Create grade (enroll student)
  const enrollStudent = useMutation({
    mutationFn: async (studentId: string) => {
      if (!studentId) {
        throw new Error('Please select a student from the list to enroll');
      }
      
      // Check if student is already enrolled
      grades.some((grade: { student: { id: number; first_name: string; last_name: string } }) => {
        if (grade.student.id === parseInt(studentId, 10)) {
          const student = students.find((s: { id: number; first_name: string; last_name: string }) => 
            s.id === parseInt(studentId, 10)
          );
          throw new Error(
            `${student?.first_name} ${student?.last_name} is already enrolled in this course. ` +
            'Each student can only be enrolled once in a course.'
          );
        }
        return false;
      });

      return api.post('/grades/', {
        student_id: parseInt(studentId, 10),
        course_id: parseInt(id!, 10),
        score: null,
        comments: '',
      });
    },
    onSuccess: () => {
      const student = students.find((s: { id: number; first_name: string; last_name: string }) => 
        s.id === parseInt(selectedStudent!, 10)
      );
      notifications.show({
        title: 'Student Enrolled',
        message: `${student?.first_name} ${student?.last_name} has been successfully enrolled in this course`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['grades', 'course', id] });
      setEnrollModalOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Enrollment Failed',
        message: error.message || 'Unable to enroll student. Please try again.',
        color: 'red',
      });
    },
  });

  // Update grade
  const updateGrade = useMutation({
    mutationFn: async ({ gradeId, score, comments }: { gradeId: number; score: number | null; comments?: string }) => {
      if (score !== null) {
        if (score < 0 || score > 100) {
          throw new Error('Please enter a score between 0 and 100');
        }
        if (!Number.isInteger(score)) {
          throw new Error('Score must be a whole number (no decimals)');
        }
      }

      return api.put(`/grades/${gradeId}`, {
        score,
        comments: comments || '',
        submission_date: score !== null ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Grade Updated',
        message: 'The student\'s grade has been successfully updated',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['grades', 'course', id] });
      setEditingScore(null);
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Update Failed',
        message: error.message || 'Unable to update grade. Please try again.',
        color: 'red',
      });
    },
  });

  // Delete grade (unenroll student)
  const deleteGrade = useMutation({
    mutationFn: async (gradeId: number) => {
      const grade = grades.find((g: { id: number; score: number | null }) => g.id === gradeId);
      if (!grade) {
        throw new Error('Unable to find the student\'s enrollment record');
      }
      if (grade.score !== null) {
        throw new Error('Cannot unenroll a student who has already received a grade. Please clear the grade first.');
      }
      return api.delete(`/grades/${gradeId}`);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Student Unenrolled',
        message: 'The student has been successfully unenrolled from this course',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['grades', 'course', id] });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Unenrollment Failed',
        message: error.message || 'Unable to unenroll student. Please try again.',
        color: 'red',
      });
    },
  });

  if (!course && !coursesLoading) {
    return (
      <Container size="lg">
        <Title order={2} mb="xl">
          Course Not Found
        </Title>
        <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
      </Container>
    );
  }

  // Filter out already enrolled students
  const enrolledStudentIds = new Set(grades.map((g: any) => g.student_id));
  const availableStudents = students.filter((s: any) => !enrolledStudentIds.has(s.id));

  const handleEnroll = () => {
    if (selectedStudent) {
      enrollStudent.mutate(selectedStudent);
    }
  };

  const handleSaveScore = (gradeId: number, score: number) => {
    updateGrade.mutate({ gradeId, score });
  };

  const handleClearScore = (gradeId: number) => {
    updateGrade.mutate({ gradeId, score: null });
  };

  const getLetterGrade = (score: number): string => {
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

  const getStatus = (score: number | null): string => {
    if (score === null) {
      return 'Enrolled';
    }
    if (score < 60) {
      return 'Failed';
    }
    return 'Completed';
  };

  const handleScoreChange = (value: string | number) => {
    if (editingScore && typeof value === 'number') {
      setEditingScore({ ...editingScore, score: value });
    }
  };

  const startEditing = (grade: Grade) => {
    setEditingScore({
      gradeId: grade.id,
      score: grade.score ?? 0,
    });
  };

  return (
    <Container size="lg" pos="relative">
      <LoadingOverlay visible={coursesLoading || gradesLoading || studentsLoading} />

      <Group justify="space-between" mb="xl">
        <Title order={2}>
          {course?.name} ({course?.code})
        </Title>
        <Group>
          <Button variant="light" onClick={() => navigate(`/courses/${id}/edit`)}>
            Edit Course
          </Button>
          <Button
            onClick={() => setEnrollModalOpen(true)}
            disabled={grades.length >= (course?.capacity || 0)}
          >
            Add Student
          </Button>
        </Group>
      </Group>

      <Title order={3} mb="md">
        Course Details
      </Title>
      <Table mb="xl">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td fw={500}>Code</Table.Td>
            <Table.Td>{course?.code}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Name</Table.Td>
            <Table.Td>{course?.name}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Description</Table.Td>
            <Table.Td>{course?.description}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Credits</Table.Td>
            <Table.Td>{course?.credits}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Instructor</Table.Td>
            <Table.Td>{course?.instructor}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Semester</Table.Td>
            <Table.Td>{course?.semester}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Capacity</Table.Td>
            <Table.Td>
              {grades.length} / {course?.capacity}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={500}>Status</Table.Td>
            <Table.Td>{course?.status}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>

      <Title order={3} mb="md">
        Schedule
      </Title>
      <Table mb="xl">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Start Time</Table.Th>
                    <Table.Th>End Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
          {course?.schedule.map((item: any, index: number) => (
                    <Table.Tr key={index}>
              <Table.Td>{item.day}</Table.Td>
              <Table.Td>{item.start_time}</Table.Td>
              <Table.Td>{item.end_time}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Title order={3} mb="md">
        Enrolled Students
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Student ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Grade</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {grades.map((grade: Grade) => (
            <Table.Tr key={grade.id}>
              <Table.Td>{grade.student?.student_id}</Table.Td>
              <Table.Td>
                {grade.student?.first_name} {grade.student?.last_name}
              </Table.Td>
              <Table.Td>{getStatus(grade.score)}</Table.Td>
              <Table.Td>
                {editingScore?.gradeId === grade.id ? (
                  <Group gap="xs">
                    <NumberInput
                      value={editingScore.score}
                      onChange={handleScoreChange}
                      min={0}
                      max={100}
                      w={100}
                      size="xs"
                      hideControls
                    />
                    <ActionIcon
                      color="green"
                      variant="light"
                      size="sm"
                      onClick={() => editingScore && handleSaveScore(grade.id, editingScore.score)}
                      loading={updateGrade.isPending}
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="sm"
                      onClick={() => setEditingScore(null)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Group gap="xs">
                    {grade.score !== null ? grade.score.toString() : '-'}
                    <ActionIcon
                      color="blue"
                      variant="light"
                      size="sm"
                      onClick={() => startEditing(grade)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    {grade.score !== null && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="sm"
                        onClick={() => handleClearScore(grade.id)}
                        loading={updateGrade.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                )}
              </Table.Td>
              <Table.Td>{grade.score !== null ? getLetterGrade(grade.score) : '-'}</Table.Td>
              <Table.Td>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  onClick={() => deleteGrade.mutate(grade.id)}
                  loading={deleteGrade.isPending}
                  disabled={grade.score !== null}
                >
                  Remove
                </Button>
              </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

      <Modal
        opened={enrollModalOpen}
        onClose={() => {
          setEnrollModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Add Student to Course"
      >
        <Select
          label="Student"
          placeholder="Select a student"
          data={availableStudents.map((student: any) => ({
            value: student.id.toString(),
            label: `${student.first_name} ${student.last_name} (${student.student_id})`,
          }))}
          value={selectedStudent}
          onChange={setSelectedStudent}
          mb="md"
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={() => setEnrollModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            loading={enrollStudent.isPending}
            disabled={!selectedStudent || grades.length >= (course?.capacity || 0)}
          >
            Add Student
          </Button>
        </Group>
      </Modal>
    </Container>
  );
} 
