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
import { StudentsService } from '../students';
import { TeachersService } from '../teachers';
import {
  CreateSubjectDTO,
  SetStudentDTO,
  SetTeacherDTO,
  SubjectDTO,
  UpdateSubjectDTO,
} from './dto';
import { SubjectService } from './subject.service';

@Controller('subjects')
export class SubjectController {
  public constructor(
    private readonly subjectService: SubjectService,
    private readonly teacherService: TeachersService,
    private readonly studentService: StudentsService,
    private readonly lessonService: LessonService,
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
      subjectId: lesson.subjectId,
      content: lesson.content,
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
  @Get('/:id')
  public async getSubjectById(
    @Param('id') id: string,
  ): Promise<SubjectDTO | null> {
    const result = await this.subjectService.getSubjectById(Number(id));

    if (!result) {
      return null;
    }

    return this.toSubjectDTO(result);
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

  @HttpCode(HttpStatus.CREATED)
  @Get('/student/{:id}/subjects')
  public async getSubjectsByStudentId(@Param('id') id: string) {
    return this.subjectService.getSubjectsByStudentId(Number(id));
  }
}
