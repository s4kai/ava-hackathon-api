import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDTO, UpdateLessonDTO, LessonDTO } from './dto';
import { Lesson } from '@prisma/client';

@Controller('lessons')
export class LessonController {
  public constructor(private readonly lessonService: LessonService) {}

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

  // Criar uma nova aula
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async createLesson(createLessonDTO: CreateLessonDTO) {
    await this.lessonService.createLesson(createLessonDTO);
  }

  // Listar todas as aulas
  @Get('/')
  public async getAllLessons(): Promise<LessonDTO[]> {
    const result = await this.lessonService.getAllLessons({});
    return result.map((lesson) => this.toLessonDTO(lesson));
  }

  // Listar os dados de uma aula pelo ID
  @Get('/:id')
  public async getLessonById(
    @Param('id') id: string,
  ): Promise<LessonDTO | null> {
    const result = await this.lessonService.getLessonById(Number(id));
    if (!result) {
      return null;
    }
    return this.toLessonDTO(result);
  }

  // Atualizar os dados de uma aula
  @Put('/:id/update')
  async updateLesson(@Param('id') id: string, @Body() lesson: UpdateLessonDTO) {
    return this.lessonService.updateLesson(Number(id), lesson);
  }

  // Listar as aulas de uma disciplina
  @Get('/subject/:subjectId')
  public async getLessonsBySubject(@Param('subjectId') subjectId: string) {
    return this.lessonService.getLessonsBySubjectId(Number(subjectId));
  }
}
