import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Lesson } from '@prisma/client';
import { LessonDTO, UpdateLessonDTO } from './dto';
import { LessonService } from './lesson.service';

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
}
