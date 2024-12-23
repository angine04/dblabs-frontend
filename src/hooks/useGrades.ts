import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeApi } from '../services/api';
import { Grade } from '../types/grade';

export function useGrades() {
  const queryClient = useQueryClient();

  const updateGrade = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Grade> }) => gradeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });

  const createGrade = useMutation({
    mutationFn: gradeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });

  return {
    updateGrade,
    createGrade,
  };
}

export function useStudentGrades(studentId: string) {
  return useQuery({
    queryKey: ['grades', 'student', studentId],
    queryFn: () => gradeApi.getByStudent(studentId),
    enabled: !!studentId,
  });
}

export function useCourseGrades(courseId: string) {
  return useQuery({
    queryKey: ['grades', 'course', courseId],
    queryFn: () => gradeApi.getByCourse(courseId),
    enabled: !!courseId,
  });
}
