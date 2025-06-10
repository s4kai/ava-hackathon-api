import { Controller } from '@nestjs/common';

@Controller('subjects')
export class SubjectController {
  public constructor(private readonly subjectService: any) {}

  public getSubjects() {}
  public getSubjectById(id: string) {}
  public createSubject(subjectDTO: any) {}

  public setTeacherToSubject(setTeaacherDTO: any) {
    const { subjectId, teacherId } = setTeaacherDTO;
  }

  public setClassToSubject(setClassDTO: any) {
    const { subjectId, classId } = setClassDTO;
  }
}
