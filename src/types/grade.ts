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
      student_id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    course?: {
      id: number;
      code: string;
      name: string;
      semester: string;
    };
  }
  
  