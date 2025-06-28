import { LessonDTO } from '@modules/core/lessons/dto/response/lessonDTO';
import { TeacherDTO } from '@modules/core/teachers/dto';

export class SubjectDTO {
  id: number;
  code: string;
  name: string;
  lesson?: LessonDTO[];
  teachers?: TeacherDTO[];
}
