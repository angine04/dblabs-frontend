import { Card, Text, Table, Group, Select, Badge } from '@mantine/core';
import { useState } from 'react';
import { useStudentGrades } from '../../hooks/useGrades';

interface StudentGradesProps {
  studentId: string;
  studentName: string;
}

export function StudentGrades({ studentId, studentName }: StudentGradesProps) {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const { data: grades, isLoading } = useStudentGrades(studentId);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'green';
      case 'B':
        return 'blue';
      case 'C':
        return 'yellow';
      case 'D':
        return 'orange';
      default:
        return 'red';
    }
  };

  const calculateGPA = (grades: typeof grades) => {
    if (!grades || grades.length === 0) return 0;

    const gradePoints = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const totalPoints = grades.reduce((sum, grade) => {
      return sum + (gradePoints[grade.grade as keyof typeof gradePoints] || 0);
    }, 0);

    return (totalPoints / grades.length).toFixed(2);
  };

  const filteredGrades = grades?.filter(grade => 
    !selectedSemester || grade.semester === selectedSemester
  );

  const semesters = [...new Set(grades?.map(grade => grade.semester) || [])];

  return (
    <Card withBorder>
      <Group position="apart" mb="md">
        <Text fw={500}>Academic Performance</Text>
        <Select
          placeholder="Select Semester"
          value={selectedSemester}
          onChange={setSelectedSemester}
          data={semesters.map(sem => ({ value: sem, label: sem }))}
          clearable
        />
      </Group>

      {isLoading ? (
        <Text>Loading grades...</Text>
      ) : (
        <>
          <Group mb="md">
            <Text size="sm">GPA:</Text>
            <Text fw={700}>{calculateGPA(filteredGrades)}</Text>
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Course</Table.Th>
                <Table.Th>Grade</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th>Semester</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredGrades?.map((grade) => (
                <Table.Tr key={grade.id}>
                  <Table.Td>{grade.courseId}</Table.Td>
                  <Table.Td>
                    <Badge color={getGradeColor(grade.grade)}>
                      {grade.grade}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{grade.score}%</Table.Td>
                  <Table.Td>{grade.semester}</Table.Td>
                </Table.Tr>
              ))}
              {(!filteredGrades || filteredGrades.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center">
                    No grades available
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Card>
  );
} 