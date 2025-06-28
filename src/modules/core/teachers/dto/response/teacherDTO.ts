import { Subject } from '@prisma/client';

export class TeacherDTO {
  id: number;
  name: string;
  email: string;
  teacherSubjects?: Subject[];
}
