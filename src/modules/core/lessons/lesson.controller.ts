import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UpdateLessonDTO } from './dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
export class LessonController {
  public constructor(private readonly lessonService: LessonService) {}

  // Listar todas as aulas
  @Get('/')
  public async getAllLessons() {
    const result = await this.lessonService.getAllLessons({});
    return result;
  }

  // Listar os dados de uma aula pelo ID
  @Get('/:id')
  public async getLessonById(@Param('id') id: string) {
    const result = await this.lessonService.getLessonById(Number(id));
    if (!result) {
      return null;
    }

    return result;
  }

  // Atualizar os dados de uma aula
  @Put('/:id/update')
  async updateLesson(@Param('id') id: string, @Body() lesson: UpdateLessonDTO) {
    return this.lessonService.updateLesson(Number(id), lesson);
  }

  @Get('/without-quiz/:subjectId')
  async getLessonsWithoutQuiz(@Param('subjectId') subjectId: string) {
    const result = await this.lessonService.getLessonsWithoutQuiz(
      Number(subjectId),
    );
    if (!result) {
      return null;
    }

    return result;
  }
}
