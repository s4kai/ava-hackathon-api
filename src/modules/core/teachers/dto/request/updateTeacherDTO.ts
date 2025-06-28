import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDTO } from './createTeacherDTO';

export class UpdateTeacherDTO extends PartialType(CreateTeacherDTO) {}
