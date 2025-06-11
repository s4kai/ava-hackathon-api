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
import { CreateTeacherDTO } from './dto';
import { TeachersService } from './teachers.service';
import { Teacher } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // Criar um novo professor
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  async createTeacher(@Body() teacher: CreateTeacherDTO) {
    await this.teachersService.createTeacher(teacher);
  }

  // Listar todos os professores
  @Get('/')
  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await this.teachersService.getAllTeachers({});
    return teachers;
  }

  // Listar os dados de um professor pelo ID
  @Get('/:id')
  async getTeacherById(@Param('id') id: string): Promise<Teacher | null> {
    const teacher = await this.teachersService.getTeacherById(Number(id));
    return teacher;
  }

  // Atualizar os dados de um professor
  @Put('/:id/update')
  async updateTeacher(
    @Param('id') id: string,
    @Body() teacher: CreateTeacherDTO,
  ) {
    return this.teachersService.updateTeacher(Number(id), teacher);
  }

  // Listar as disciplinas de um professor
  @Get('/:id/subjects')
  async getTeacherSubjects(@Param('id') id: string) {
    return this.teachersService.getTeacherSubjects(Number(id));
  }
}
