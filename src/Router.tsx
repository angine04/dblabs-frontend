import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/dashboard/Dashboard.page';
import { ListStudents } from './pages/students/ListStudents.page';
import { AddStudent } from './pages/students/AddStudent.page';
import { EditStudent } from './pages/students/EditStudent.page';
import { ListCourses } from './pages/courses/ListCourses.page';
import { AddCourse } from './pages/courses/AddCourse.page';
import { EditCourse } from './pages/courses/EditCourse.page';
import { CourseDetails } from './pages/courses/CourseDetails.page';
import { GradeManagement } from './pages/grades/GradeManagement.page';
import { useEffect } from 'react';

function AppShellWithTitle() {
  const location = useLocation();

  useEffect(() => {
    const getTitle = (pathname: string) => {
      const baseName = 'Student Management System';
      const titles: { [key: string]: string } = {
        '/': `Dashboard | ${baseName}`,
        '/dashboard': `Dashboard | ${baseName}`,
        '/students': `Students | ${baseName}`,
        '/students/add': `Add Student | ${baseName}`,
        '/courses': `Courses | ${baseName}`,
        '/courses/add': `Add Course | ${baseName}`,
        '/grades': `Grade Management | ${baseName}`,
      };

      // Handle dynamic routes
      if (pathname.match(/^\/students\/\d+$/)) {
        return `Student Details | ${baseName}`;
      }
      if (pathname.match(/^\/students\/\d+\/edit$/)) {
        return `Edit Student | ${baseName}`;
      }
      if (pathname.match(/^\/courses\/\d+\/edit$/)) {
        return `Edit Course | ${baseName}`;
      }
      if (pathname.match(/^\/courses\/\d+\/students$/)) {
        return `Course Students | ${baseName}`;
      }

      return titles[pathname] || baseName;
    };

    document.title = getTitle(location.pathname);
  }, [location]);

  return <AppShell />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShellWithTitle />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/students',
        element: <ListStudents />,
      },
      {
        path: '/students/add',
        element: <AddStudent />,
      },
      {
        path: '/students/:id',
        element: <EditStudent/>,
      },
      {
        path: '/students/:id/edit',
        element: <EditStudent />,
      },
      {
        path: '/courses',
        element: <ListCourses />,
      },
      {
        path: '/courses/add',
        element: <AddCourse />,
      },
      {
        path: '/courses/:id',
        element: <EditCourse />,
      },
      {
        path: '/courses/:id/students',
        element: <CourseDetails />,
      },
      {
        path: '/grades',
        element: <GradeManagement />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
