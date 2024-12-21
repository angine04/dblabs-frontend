export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  enrollment_date?: string;
  program: string;
  status: string;
  contact_number?: string;
  created_at?: string;
  updated_at?: string;
}
