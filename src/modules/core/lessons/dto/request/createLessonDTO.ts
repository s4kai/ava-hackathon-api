import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDTO {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsDate()
  readonly date: Date;

  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsNotEmpty()
  readonly subjectId: number;

  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
