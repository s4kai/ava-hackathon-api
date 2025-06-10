export class LessonController {
  public constructor(private readonly lessonService: any) {}

  public getLessonsBySubject(subjectId: string) {}

  public getLessonById(id: string) {}

  public createLesson(lessonDTO: any) {}

  public createLessonPlan(lessonPlanDTO: any) {
    const { lessonId, plan } = lessonPlanDTO;
  }
}
