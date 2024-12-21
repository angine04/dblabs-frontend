export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | null;
  studentId: string;
  enrollmentDate: Date | null;
  grade: string;
  program: string;
  status: string;
  contactNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
} 