import axios from 'axios';
import { Student } from '../types/student';
import { Course, Grade } from '../types/course';

// Create base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    if (response.config.url?.includes('/students')) {
      console.log('Student API Response:', response.data);
    }
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Helper function to transform student data for API
const transformStudentToApi = (student: Partial<Student>) => ({
  student_id: student.studentId,
  first_name: student.firstName,
  last_name: student.lastName,
  email: student.email,
  date_of_birth: student.dateOfBirth,
  enrollment_date: student.enrollmentDate,
  program: student.program,
  status: student.status || 'active',
  contact_number: student.contactNumber
});

// Helper function to transform API response to frontend format
const transformStudentFromApi = (data: any): Student => {
  // Handle both snake_case and camelCase responses
  return {
    id: data.id?.toString(),
    studentId: data.student_id || data.studentId,
    firstName: data.first_name || data.firstName,
    lastName: data.last_name || data.lastName,
    email: data.email,
    dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
    enrollmentDate: data.enrollment_date ? new Date(data.enrollment_date) : null,
    program: data.program || '',
    status: data.status || 'active',
    contactNumber: data.contact_number || data.contactNumber || '',
    grade: data.grade || '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  };
};

export const studentApi = {
  getAll: async () => {
    try {
      const { data } = await api.get<any[]>('/students');
      return Array.isArray(data) ? data.map(transformStudentFromApi) : [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    const { data } = await api.get<any>(`/students/${id}`);
    return transformStudentFromApi(data);
  },

  create: async (student: Omit<Student, 'id'>) => {
    const { data } = await api.post<any>('/students', transformStudentToApi(student));
    return transformStudentFromApi(data);
  },

  update: async (id: string, student: Partial<Student>) => {
    const { data } = await api.put<any>(`/students/${id}`, transformStudentToApi(student));
    return transformStudentFromApi(data);
  },

  delete: async (id: string) => {
    await api.delete(`/students/${id}`);
  },
}; 

export const courseApi = {
  getAll: async () => {
    const { data } = await api.get<Course[]>('/courses');
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
    const { data } = await api.post<Grade>('/grades', gradeData);
    return data;
  }
};

export { api };