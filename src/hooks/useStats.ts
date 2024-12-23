/* eslint-disable curly */
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface DashboardStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  average_gpa: number;
  program_distribution: { name: string; value: number }[];
  gpa_distribution: { range: string; count: number }[];
}

interface Grade {
  id: number;
  course_id: number;
  score: number;
  student?: {
    student_id: string;
    first_name: string;
    last_name: string;
  };
}

interface Course {
  id: number;
  credits: number;
}

function getGPAFromScore(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.0;
  if (score >= 70) return 2.0;
  if (score >= 60) return 1.0;
  return 0.0;
}

function getGPARange(gpa: number): string {
  if (gpa >= 4.0) return '4.0';
  if (gpa >= 3.8) return '3.8-3.9';
  if (gpa >= 3.6) return '3.6-3.7';
  if (gpa >= 3.4) return '3.4-3.5';
  if (gpa >= 3.2) return '3.2-3.3';
  if (gpa >= 3.0) return '3.0-3.1';
  if (gpa >= 2.8) return '2.8-2.9';
  if (gpa >= 2.6) return '2.6-2.7';
  if (gpa >= 2.4) return '2.4-2.5';
  if (gpa >= 2.2) return '2.2-2.3';
  if (gpa >= 2.0) return '2.0-2.1';
  if (gpa >= 1.8) return '1.8-1.9';
  if (gpa >= 1.6) return '1.6-1.7';
  if (gpa >= 1.4) return '1.4-1.5';
  if (gpa >= 1.2) return '1.2-1.3';
  if (gpa >= 1.0) return '1.0-1.1';
  if (gpa >= 0.8) return '0.8-0.9';
  if (gpa >= 0.6) return '0.6-0.7';
  if (gpa >= 0.4) return '0.4-0.5';
  if (gpa >= 0.2) return '0.2-0.3';
  return '0.0-0.1';
}

export function useStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const students = await api.get('/students/');
      const grades = await api.get('/grades/');
      const courses = await api.get('/courses/');

      // Create a map of course IDs to credits
      const courseCredits = new Map(
        (courses.data as Course[]).map((course) => [course.id, course.credits])
      );

      // Calculate total students
      const totalStudents = students.data.length;

      // Calculate active and graduated students
      const activeStudents = students.data.filter((s: any) => s.status === 'active').length;
      const graduatedStudents = students.data.filter((s: any) => s.status === 'graduated').length;

      // Calculate program distribution
      const programDistribution = students.data.reduce((acc: any, student: any) => {
        if (!student.program) return acc;
        acc[student.program] = (acc[student.program] || 0) + 1;
        return acc;
      }, {});

      // Calculate GPA distribution per student
      const studentGrades = new Map();
      (grades.data as Grade[]).forEach((grade) => {
        if (grade.score == null || !courseCredits.has(grade.course_id) || !grade.student) return;

        const studentId = grade.student.student_id;
        if (!studentGrades.has(studentId)) {
          studentGrades.set(studentId, {
            totalWeightedGPA: 0,
            totalCredits: 0,
          });
        }

        const credits = courseCredits.get(grade.course_id) || 0;
        const studentData = studentGrades.get(studentId);
        studentData.totalWeightedGPA += getGPAFromScore(grade.score) * credits;
        studentData.totalCredits += credits;
      });

      // Calculate GPA ranges distribution
      const gpaRanges = {
        '4.0': 0,
        '3.8-3.9': 0,
        '3.6-3.7': 0,
        '3.4-3.5': 0,
        '3.2-3.3': 0,
        '3.0-3.1': 0,
        '2.8-2.9': 0,
        '2.6-2.7': 0,
        '2.4-2.5': 0,
        '2.2-2.3': 0,
        '2.0-2.1': 0,
        '1.8-1.9': 0,
        '1.6-1.7': 0,
        '1.4-1.5': 0,
        '1.2-1.3': 0,
        '1.0-1.1': 0,
        '0.8-0.9': 0,
        '0.6-0.7': 0,
        '0.4-0.5': 0,
        '0.2-0.3': 0,
        '0.0-0.1': 0,
      } as Record<string, number>;

      let totalGPA = 0;
      let studentCount = 0;

      studentGrades.forEach((data) => {
        const gpa = data.totalWeightedGPA / data.totalCredits;
        const range = getGPARange(gpa);
        gpaRanges[range]++;
        totalGPA += gpa;
        studentCount++;
      });

      const gpaDistribution = Object.entries(gpaRanges).map(([range, count]) => ({
        range,
        count,
      }));

      // Calculate average GPA
      const averageGPA = studentCount > 0 ? Number((totalGPA / studentCount).toFixed(2)) : 0;

      return {
        total_students: totalStudents,
        active_students: activeStudents,
        graduated_students: graduatedStudents,
        average_gpa: averageGPA,
        program_distribution: Object.entries(programDistribution).map(([name, value]) => ({
          name,
          value,
        })),
        gpa_distribution: gpaDistribution,
      };
    },
  });
}
