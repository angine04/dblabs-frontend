export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  instructor: string;
  semester: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  enrolledCount?: number;
  status: 'active' | 'inactive' | 'completed';
}

export interface Grade {
  id: string;
  student_id: number;
  course_id: number;
  score: number;
  semester: string;
  submission_date: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: number;
    code: string;
    name: string;
    semester: string;
  };
}

