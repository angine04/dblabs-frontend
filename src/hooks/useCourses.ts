import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../services/api';
import { Course } from '../types/course';

export function useCourses() {
  const queryClient = useQueryClient();

  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getAll,
  });

  const createCourse = useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  return {
    courses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => id ? courseApi.getById(id) : null,
    enabled: !!id,
  });
} 