import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDTO } from './createLessonDTO';

export class UpdateLessonDTO extends PartialType(CreateLessonDTO) {}
