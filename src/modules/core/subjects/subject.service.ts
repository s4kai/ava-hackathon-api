import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { CreateSubjectDTO, UpdateSubjectDTO } from './dto';
import { Prisma } from '@prisma/client';

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
    });
  }

  public async getSubjectById(id: number) {
    return this.prismaService.subject.findUnique({
      where: { id },
    });
  }

  public async updateSubject(id: number, subjectDTO: UpdateSubjectDTO) {
    return this.prismaService.subject.update({
      where: { id },
      data: subjectDTO,
    });
  }
}
