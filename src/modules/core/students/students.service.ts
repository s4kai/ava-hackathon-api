import { PrismaService } from '@modules/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Student, StudentCustomMaterial } from '@prisma/client';
import { createStudentDTO } from './dto';

@Injectable()
export class StudentsService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createStudent(student: createStudentDTO): Promise<Student> {
    return this.prismaService.student.create({
      data: {
        name: student.name,
        status: student.status,
      },
    });
  }

  public async updateStudent(
    id: number,
    student: createStudentDTO,
  ): Promise<Student> {
    return this.prismaService.student.update({
      where: { id },
      data: {
        name: student.name,
        status: student.status,
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

  public async getAllStudentCustomMaterials(
    id: number,
  ): Promise<StudentCustomMaterial[] | null> {
    const customMaterials =
      await this.prismaService.studentCustomMaterial.findMany({
        where: { id },
      });

    if (!customMaterials) {
      throw new BadRequestException(
        `Student with this ID ${id} does not exists`,
      );
    }

    return customMaterials;
  }
}
