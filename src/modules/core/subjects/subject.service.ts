import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { Prisma, Student, Teacher } from '@prisma/client';
import { CreateSubjectDTO, UpdateSubjectDTO } from './dto';

@Injectable()
export class SubjectService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createSubject(createSubjectDTO: CreateSubjectDTO) {
    return this.prismaService.subject.create({
      data: createSubjectDTO,
    });
  }

  public async getAllSubjects(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SubjectWhereUniqueInput;
    where?: Prisma.SubjectWhereInput;
    orderBy?: Prisma.SubjectOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.subject.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { Lesson: true, TeacherSubject: { include: { teacher: true } } },
    });
  }

  public async getSubjectById(id: number) {
    return this.prismaService.subject.findUnique({
      where: { id },
      include: {
        Lesson: true,
        TeacherSubject: { include: { teacher: true } },
        StudentSubject: { include: { student: true } },
      },
    });
  }

  public async updateSubject(id: number, subjectDTO: UpdateSubjectDTO) {
    return this.prismaService.subject.update({
      where: { id },
      data: subjectDTO,
    });
  }

  public async setTeacherToSubject(id: number, teacher: Teacher) {
    return this.prismaService.subject.update({
      where: { id },
      data: {
        TeacherSubject: {
          create: { teacherId: teacher.id },
        },
      },
    });
  }

  public async setStudentToSubject(id: number, student: Student) {
    return this.prismaService.subject.update({
      where: { id },
      data: {
        StudentSubject: {
          create: { studentId: student.id },
        },
      },
    });
  }

  public async getSubjectsByStudentId(id: number) {
    return this.prismaService.subject.findMany({
      where: { StudentSubject: { some: { studentId: id } } },
      include: { Lesson: true, TeacherSubject: { include: { teacher: true } } },
    });
  }
}
