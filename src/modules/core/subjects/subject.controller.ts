import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Lesson, Subject } from '@prisma/client';
import { LessonService } from '../lessons';
import { CreateLessonDTO, LessonDTO } from '../lessons/dto';
import { QuizService } from '../quizzes';
import { StudentsService } from '../students';
import { TeachersService } from '../teachers';
import {
  CreateSubjectDTO,
  SetStudentDTO,
  SetTeacherDTO,
  SubjectDTO,
  UpdateSubjectDTO,
} from './dto';
import { StudentQuizDTO } from './dto/request/sudentQuizDTO';
import { SubjectService } from './subject.service';

@Controller('subjects')
export class SubjectController {
  public constructor(
    private readonly subjectService: SubjectService,
    private readonly teacherService: TeachersService,
    private readonly studentService: StudentsService,
    private readonly lessonService: LessonService,
    private readonly quizService: QuizService,
  ) {}

  private toSubjectDTO(subject: Subject): SubjectDTO {
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
    };
  }

  private toLessonDTO(lesson: Lesson): LessonDTO {
    return {
      id: lesson.id,
      title: lesson.title,
      date: lesson.date,
      type: lesson.type,
      description: lesson.description || '',
      subjectId: lesson.subjectId,
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async createSubject(
    @Body() createSubjectDTO: CreateSubjectDTO,
  ): Promise<SubjectDTO> {
    const result = await this.subjectService.createSubject(createSubjectDTO);

    return this.toSubjectDTO(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/')
  public async getAllSubjects(): Promise<SubjectDTO[]> {
    const result = await this.subjectService.getAllSubjects({});
    return result.map((subject) => this.toSubjectDTO(subject));
  }

  @HttpCode(HttpStatus.OK)
  @Post('/:id')
  public async getSubjectById(@Param('id') id: string, @Body() body: any) {
    const result = await this.subjectService.getSubjectById(
      Number(id),
      Number(body?.studentId),
    );

    if (!result) {
      return null;
    }
    return {
      ...this.toSubjectDTO(result),
      lessons: result.Lesson.map((lesson) => {
        const wasTaken =
          (lesson.lessonQuiz?._count?.StudentQuizResult || 0) > 0;

        const percentage = wasTaken
          ? ((lesson.lessonQuiz?.StudentQuizResult[0].score || 0) * 100) /
            (lesson.lessonQuiz?.maxScore || 1)
          : 0;

        return {
          ...this.toLessonDTO(lesson),
          quiz: {
            id: lesson.lessonQuiz?.id,
            name: lesson.lessonQuiz?.title,
            description: lesson.lessonQuiz?.description,
            wasTaken: (lesson.lessonQuiz?._count?.StudentQuizResult || 0) > 0,
            percentage: percentage,
          },
          customMaterials: lesson.StudentCustomMaterial,
        };
      }),
      teachers: result.TeacherSubject.map((teacherSubject) => ({
        id: teacherSubject.teacher.id,
        name: teacherSubject.teacher.name,
        email: teacherSubject.teacher.email,
      })),
      students: result.StudentSubject.map((studentSubject) => ({
        id: studentSubject.student.id,
        name: studentSubject.student.name,
      })),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id/quiz-analysis')
  public async getSubjectQuizAnalysis(@Param('id') id: string) {
    return await this.quizService.getQuizAnalyticsBySubject(Number(id));
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id/update')
  public async updateSubject(
    @Param('id') id: string,
    @Body() subject: UpdateSubjectDTO,
  ) {
    return this.subjectService.updateSubject(Number(id), subject);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/{:id}/add-teacher')
  public async setTeacherToSubject(
    @Param('id') id: string,
    @Body() body: SetTeacherDTO,
  ) {
    if (!id) {
      throw new BadRequestException('Subject ID is required');
    }

    const { teacherId } = body;
    const teacher = await this.teacherService.getTeacherById(Number(teacherId));

    if (!teacher) {
      return 'Teacher not found on database';
    }

    await this.subjectService.setTeacherToSubject(Number(id), teacher);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/{:id}/add-student')
  public async setStudentToSubject(
    @Param('id') id: string,
    @Body() body: SetStudentDTO,
  ) {
    const { studentId } = body;
    const student = await this.studentService.getStudentById(Number(studentId));

    if (!student) {
      return 'Teacher not found on database';
    }

    await this.subjectService.setStudentToSubject(Number(id), student);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/{:id}/lessons')
  public async getLessonsBySubject(
    @Param('id') id: string,
  ): Promise<LessonDTO[]> {
    return await this.lessonService.getLessonsBySubjectId(Number(id));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/{:id}/lessons/create')
  public async createLesson(
    @Param('id') id: string,
    @Body() createLessonDTO: CreateLessonDTO,
  ): Promise<LessonDTO | string> {
    const subject = await this.subjectService.getSubjectById(Number(id));

    if (!subject) {
      return 'Subject not found';
    }

    createLessonDTO.subjectId = Number(subject.id);

    const result = await this.lessonService.createLesson(createLessonDTO);

    return this.toLessonDTO(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/student/{:id}')
  public async getSubjectsByStudentId(@Param('id') id: string) {
    const data = await this.subjectService.getSubjectsByStudentId(Number(id));

    return await data.map((subject) => {
      return {
        ...this.toSubjectDTO(subject),
        lessons: subject.Lesson.map((lesson) => this.toLessonDTO(lesson)),
        teachers: subject.TeacherSubject.map((teacherSubject) => ({
          id: teacherSubject.teacher.id,
          name: teacherSubject.teacher.name,
          email: teacherSubject.teacher.email,
        })),
      };
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('/teacher/{:id}')
  public async getSubjectsByTeacherId(@Param('id') id: string) {
    const data = await this.subjectService.getSubjectsByTeacherId(Number(id));

    return data.map((subject) => {
      return {
        ...this.toSubjectDTO(subject),
        enrolledStudents: subject._count.StudentSubject,
        lessonsAmount: subject._count.Lesson,
      };
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('/{:id}/student-quiz-analytics')
  public async getStudentSubjectAnalysis(
    @Param('id') id: string,
    @Body() body: StudentQuizDTO,
  ) {
    const { studentId } = body;

    const data = await this.quizService.getStudentSubjectQuizAnalytics(
      Number(studentId),
      Number(id),
    );

    if (!data) {
      return 'No data found for this student in this subject';
    }

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/{:id}/students-quiz-analytics')
  public async getStudentsSubjectAnalysis(@Param('id') id: string) {
    const data = await this.quizService.getStudentsQuizAnalytics(Number(id));

    if (!data) {
      return 'No data found for this student in this subject';
    }

    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/{:id}/recent-activity')
  public async getRecentActivity(@Param('id') id: string) {
    return await this.quizService.getRecentStudentsResults(Number(id));
  }
}
