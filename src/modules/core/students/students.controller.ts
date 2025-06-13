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

import { Request } from 'express';
import { createStudentDTO } from './dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  async createStudent(@Body() dto: createStudentDTO) {
    return this.studentsService.createStudent(dto);
  }

  @Put('/{id}/update')
  async updateStudent(@Param('id') id: string, @Body() dto: createStudentDTO) {
    return this.studentsService.updateStudent(Number(id), dto);
  }

  @Get('/')
  async getAllStudents() {
    return this.studentsService.getAllStudents({});
  }

  @Get('/:id')
  async getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(Number(id));
  }
}
