import { LessonDTO } from '@modules/core/lessons/dto/response/lessonDTO';

export class SubjectDTO {
  id: number;
  code: string;
  name: string;
  lesson?: LessonDTO[];
}
