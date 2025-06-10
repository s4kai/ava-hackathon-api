import { Controller } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller('lessons')
export class LessonController {
  public constructor(private readonly lessonService: LessonService) {}

  public getLessonsBySubject(subjectId: string) {}

  public getLessonById(id: string) {}

  public createLesson(lessonDTO: any) {}

  public createLessonPlan(lessonPlanDTO: any) {
    const { lessonId, plan } = lessonPlanDTO;
  }
}
