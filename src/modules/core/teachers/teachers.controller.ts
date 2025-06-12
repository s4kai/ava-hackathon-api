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
import { CreateTeacherDTO, TeacherDTO, UpdateTeacherDTO } from './dto';
import { TeachersService } from './teachers.service';
import { Teacher } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  private toTeacherDTO(teacher: Teacher): TeacherDTO {
    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
    };
  }

  // Criar um novo professor
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  async createTeacher(@Body() teacher: CreateTeacherDTO) {
    await this.teachersService.createTeacher(teacher);
  }

  // Listar todos os professores
  @Get('/')
  async getAllTeachers(): Promise<TeacherDTO[]> {
    const result = await this.teachersService.getAllTeachers({});
    return result.map((teacher) => this.toTeacherDTO(teacher));
  }

  // Listar os dados de um professor pelo ID
  @Get('/:id')
  async getTeacherById(@Param('id') id: string): Promise<TeacherDTO | null> {
    const result = await this.teachersService.getTeacherById(Number(id));
    if (!result) {
      return null;
    }
    return this.toTeacherDTO(result);
  }

  // Atualizar os dados de um professor
  @Put('/:id/update')
  async updateTeacher(
    @Param('id') id: string,
    @Body() teacher: UpdateTeacherDTO,
  ) {
    return this.teachersService.updateTeacher(Number(id), teacher);
  }

  // Listar as disciplinas de um professor
  @Get('/:id/subjects')
  async getTeacherSubjects(@Param('id') id: string) {
    return this.teachersService.getTeacherSubjects(Number(id));
  }
}
