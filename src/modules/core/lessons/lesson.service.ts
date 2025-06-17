import { PrismaService } from '@modules/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateLessonDTO, CreateLessonDTO } from './dto';

@Injectable()
export class LessonService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createLesson(createLessonDTO: CreateLessonDTO) {
    return this.prismaService.lesson.create({
      data: {
        title: createLessonDTO.title,
        date: new Date(createLessonDTO.date),
        type: createLessonDTO.type,
        subjectId: createLessonDTO.subjectId,
        content: createLessonDTO.content,
      },
    });
  }

  public async getAllLessons(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LessonWhereUniqueInput;
    where?: Prisma.LessonWhereInput;
    orderBy?: Prisma.LessonOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.lesson.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  public async getLessonById(id: number) {
    const lesson = await this.prismaService.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new BadRequestException(`Lesson with this ID ${id} not found`);
    }

    return lesson;
  }

  public async updateLesson(id: number, lesson: UpdateLessonDTO) {
    return this.prismaService.lesson.update({
      where: { id },
      data: lesson,
    });
  }

  public async getLessonsBySubjectId(subjectId: number) {
    const lessons = await this.prismaService.lesson.findMany({
      where: { subjectId },
    });

    if (!lessons) {
      throw new BadRequestException(
        `Lessons with this Subject ID ${subjectId} not found`,
      );
    }

    return lessons;
  }
}
