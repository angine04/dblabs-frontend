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
    start_time: string;
    end_time: string;
  }[];
  capacity: number;
  enrolled_count?: number;
  status: 'active' | 'inactive' | 'completed';
  created_at?: string;
  updated_at?: string;
}
