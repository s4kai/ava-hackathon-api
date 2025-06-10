import { Body, Controller, Post } from '@nestjs/common';

import { createStudentDTO } from './dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('/create')
  async createStudent(@Body() dto: createStudentDTO) {
    return this.studentsService.createStudent(dto);
  }
}
