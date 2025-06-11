import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { CreateTeacherDTO } from './dto/createTeacherDTO';
import { Prisma, Teacher, TeacherSubject } from '@prisma/client';

@Injectable()
export class TeachersService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createTeacher(teacher: CreateTeacherDTO): Promise<Teacher> {
    return this.prismaService.teacher.create({
      data: {
        name: teacher.name,
        email: teacher.email,
      },
    });
  }

  public async updateTeacher(
    id: number,
    teacher: CreateTeacherDTO,
  ): Promise<Teacher> {
    return this.prismaService.teacher.update({
      where: { id },
      data: {
        name: teacher.name,
        email: teacher.email,
      },
    });
  }

  public async getAllTeachers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TeacherWhereUniqueInput;
    where?: Prisma.TeacherWhereInput;
    orderBy?: Prisma.TeacherOrderByWithRelationInput;
  }): Promise<Teacher[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prismaService.teacher.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  public async getTeacherById(id: number): Promise<Teacher | null> {
    return this.prismaService.teacher.findUnique({
      where: { id },
    });
  }

  public async getTeacherSubjects(
    id: number,
  ): Promise<TeacherSubject[] | null> {
    return this.prismaService.teacherSubject.findMany({
      where: { teacherId: id },
      include: { subject: true },
    });
  }
}
