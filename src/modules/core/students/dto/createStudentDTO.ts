import { IsNotEmpty, IsString } from 'class-validator';

export class createStudentDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
