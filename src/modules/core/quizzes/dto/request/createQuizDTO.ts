import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { QuestionDTO } from '../questionDTO';

export class CreateQuizDTO {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly lessonId: number;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly timeLimit: number;

  @IsNotEmpty()
  questions: QuestionDTO[];
}
