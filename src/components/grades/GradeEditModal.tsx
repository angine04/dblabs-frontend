import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, NumberInput, Select, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { studentApi } from '../../services/api';
import { Grade } from '../../types/grade';

interface GradeEditModalProps {
  opened: boolean;
  onClose: () => void;
  studentData: {
    studentName: string;
    grades: Grade;
  };
  onSubmit: (values: { score: number; comments?: string; student_id?: string }) => Promise<void>;
  isNew?: boolean;
}

export function GradeEditModal({
  opened,
  onClose,
  studentData,
  onSubmit,
  isNew,
}: GradeEditModalProps) {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentApi.getAll,
    enabled: isNew,
  });

  const form = useForm({
    initialValues: {
      student_id: '',
      score: 0,
      comments: '',
    },
  });

  useEffect(() => {
    if (!isNew && studentData.grades) {
      form.setValues({
        student_id: studentData.grades.student_id?.toString() || '',
        score: studentData.grades.score,
        comments: studentData.grades.comments || '',
      });
    }
  }, [studentData.grades, isNew]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isNew ? 'Add New Grade' : `Edit Grade - ${studentData.studentName}`}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {isNew && (
            <Select
              label="Student"
              required
              data={students.map((student) => ({
                value: student.id?.toString() || '',
                label: `${student.first_name} ${student.last_name} (${student.student_id})`,
              }))}
              {...form.getInputProps('student_id')}
            />
          )}
          <NumberInput label="Score" required max={100} min={0} {...form.getInputProps('score')} />
          <Textarea label="Comments" {...form.getInputProps('comments')} />
          <Button type="submit">{isNew ? 'Add Grade' : 'Save Changes'}</Button>
        </Stack>
      </form>
    </Modal>
  );
}
