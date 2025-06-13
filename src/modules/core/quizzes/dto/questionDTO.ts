import { IsNumber, IsString } from 'class-validator';

export class QuestionDTO {
  @IsString()
  question: string;

  @IsString({ each: true })
  options: string[];

  @IsNumber()
  correctAnswer: number;

  @IsString()
  type: string;

  @IsString()
  explanation: string;
}
