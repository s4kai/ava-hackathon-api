import { Injectable } from '@nestjs/common';
import { Student } from '@prisma/client';
import { PrismaService } from 'src/modules/shared/prisma.service';
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
}
