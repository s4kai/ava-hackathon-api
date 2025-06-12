import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDTO {
  @IsNotEmpty()
  @IsString()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
