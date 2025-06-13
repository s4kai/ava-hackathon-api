import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDTO {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly date: string;

  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsNotEmpty()
  subjectId: number;

  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
