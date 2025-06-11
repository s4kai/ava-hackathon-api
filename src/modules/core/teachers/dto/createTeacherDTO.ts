import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}
