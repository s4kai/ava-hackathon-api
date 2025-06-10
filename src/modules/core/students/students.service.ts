import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { createStudentDTO } from './dto';

@Injectable()
export class StudentsService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createStudent(dto: createStudentDTO): Promise<Student> {
    return this.prismaService.student.create({
      data: {
        name: dto.name,
        status: dto.status,
      },
    });
  }

  public async updateStudent(
    id: number,
    dto: createStudentDTO,
  ): Promise<Student> {
    return this.prismaService.student.update({
      where: { id },
      data: {
        name: dto.name,
        status: dto.status,
      },
    });
  }

  public async getAllStudents(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StudentWhereUniqueInput;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }): Promise<Student[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prismaService.student.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  public async getStudentById(id: number): Promise<Student | null> {
    return this.prismaService.student.findUnique({
      where: { id },
    });
  }
}
