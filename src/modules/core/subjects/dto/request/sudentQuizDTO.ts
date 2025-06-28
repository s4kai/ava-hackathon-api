import { IsNotEmpty, IsNumber } from 'class-validator';

export class StudentQuizDTO {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;
}
