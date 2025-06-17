import { Controller, Get, Param } from '@nestjs/common';
import { CustomMaterialService } from './custom-material.service';
import { StudentsService } from '../students';

@Controller('custom-material')
export class CustomMaterialController {
  public constructor(
    private readonly customMaterialService: CustomMaterialService,
    private readonly studentService: StudentsService,
  ) {}

  @Get('/student/:id')
  public getAllStudentCustomMaterials(@Param('id') id: string) {
    return this.studentService.getAllStudentCustomMaterials(Number(id));
  }
}
