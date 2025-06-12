import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDTO, SubjectDTO, UpdateSubjectDTO } from './dto';
import { Subject } from '@prisma/client';

@Controller('subjects')
export class SubjectController {
  public constructor(private readonly subjectService: SubjectService) {}

  private toSubjectDTO(subject: Subject): SubjectDTO {
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async createSubject(createSubjectDTO: CreateSubjectDTO) {
    await this.subjectService.createSubject(createSubjectDTO);
  }

  @Get('/')
  public async getAllSubjects(): Promise<SubjectDTO[]> {
    const result = await this.subjectService.getAllSubjects({});
    return result.map((subject) => this.toSubjectDTO(subject));
  }

  @Get('/:id')
  public async getSubjectById(
    @Param('id') id: string,
  ): Promise<SubjectDTO | null> {
    const result = await this.subjectService.getSubjectById(Number(id));

    if (!result) {
      return null;
    }

    return this.toSubjectDTO(result);
  }

  @Put('/:id/update')
  async updateSubject(
    @Param('id') id: string,
    @Body() subject: UpdateSubjectDTO,
  ) {
    return this.subjectService.updateSubject(Number(id), subject);
  }

  // Criar endpoint para definir o professor em uma disciplina

  /*
  public setTeacherToSubject(setTeaacherDTO: any) {
    const { subjectId, teacherId } = setTeaacherDTO;
  }

  public setClassToSubject(setClassDTO: any) {
    const { subjectId, classId } = setClassDTO;
  }
    */
}
