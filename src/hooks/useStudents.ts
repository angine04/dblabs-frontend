import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../services/api';
import { Student } from '../types/student';

export function useStudents() {
  const queryClient = useQueryClient();

  const students = useQuery({
    queryKey: ['students'],
    queryFn: studentApi.getAll,
  });

  const createStudent = useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  return {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentApi.getById(id),
  });
}
