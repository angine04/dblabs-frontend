import axios from 'axios';
import { Student } from '../types/student';
import { Course } from '../types/course';
import { Grade } from '../types/grade';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export const studentApi = {
  getAll: async () => {
    const { data } = await api.get<Student[]>('/students/');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Student>(`/students/${id}`);
    return data;
  },

  create: async (student: Omit<Student, 'id'>) => {
    const { data } = await api.post<Student>('/students', student);
    return data;
  },

  update: async (id: string, student: Partial<Student>) => {
    const { data } = await api.put<Student>(`/students/${id}`, student);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/students/${id}`);
  },
}; 


export const courseApi = {
  getAll: async () => {
    const { data } = await api.get<Course[]>('/courses/');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Course>(`/courses/${id}`);
    return data;
  },

  create: async (course: Omit<Course, 'id'>) => {
    const { data } = await api.post<Course>('/courses', course);
    return data;
  },

  update: async (id: string, course: Partial<Course>) => {
    const { data } = await api.put<Course>(`/courses/${id}`, course);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/courses/${id}`);
  },
}; 

export const gradeApi = {
  getByCourse: async (courseId: string) => {
    const { data } = await api.get<Grade[]>(`/grades/course/${courseId}`);
    return data;
  },

  getByStudent: async (studentId: string) => {
    const { data } = await api.get<Grade[]>(`/grades/student/${studentId}`);
    return data;
  },

  update: async (gradeId: string, gradeData: Partial<Grade>) => {
    const { data } = await api.put<Grade>(`/grades/${gradeId}`, gradeData);
    return data;
  },

  create: async (gradeData: Omit<Grade, 'id'>) => {
    const { data } = await api.post<Grade>('/grades/', gradeData);
    return data;
  }
}; 