import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ListStudents } from './pages/students/ListStudents.page';
import { AddStudent } from './pages/students/AddStudent.page';
import { EditStudent } from './pages/students/EditStudent.page';
import { Dashboard } from './pages/dashboard/Dashboard.page';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ListCourses } from './pages/courses/ListCourses.page';
import { AddCourse } from './pages/courses/AddCourse.page';
import { EditCourse } from './pages/courses/EditCourse.page';
import { CourseDetails } from './pages/courses/CourseDetails.page';
import { GradeManagement } from './pages/grades/GradeManagement.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'students',
        children: [
          {
            index: true,
            element: <ListStudents />,
          },
          {
            path: 'add',
            element: <AddStudent />,
          },
          {
            path: ':id',
            element: <EditStudent />,
          },
        ],
      },
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: <ListCourses />,
          },
          {
            path: 'add',
            element: <AddCourse />,
          },
          {
            path: ':id',
            element: <CourseDetails />,
          },
          {
            path: ':id/edit',
            element: <EditCourse />,
          },
          {
            path: ':id/students',
            element: <CourseDetails />,
          },
        ],
      },
      {
        path: 'grades',
        element: <GradeManagement />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
