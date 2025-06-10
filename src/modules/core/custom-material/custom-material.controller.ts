import { Controller } from '@nestjs/common';
import { CustomMaterialService } from './custom-material.service';

@Controller('custom-material')
export class CustomMaterialController {
  public constructor(
    private readonly customMaterialService: CustomMaterialService,
  ) {}

  public getCustomMaterialById(id: string) {}
  public getStudentCustomMaterial(studentId: string) {}

  public generateCustomMaterial(generateCustomMaterialDTO: any) {
    const { studentId, lessonId } = generateCustomMaterialDTO;
  }
}
