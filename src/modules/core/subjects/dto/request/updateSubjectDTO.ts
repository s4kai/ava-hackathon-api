import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDTO } from './createSubjectDTO';

export class UpdateSubjectDTO extends PartialType(CreateSubjectDTO) {}
