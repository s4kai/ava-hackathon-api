import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateQuizDTO } from './dto/request/createQuizDTO';
import { SubmitQuizDTO } from './dto/request/submitQuizDTO';
import { QuizService } from './quizzes.service';

@Controller('quizzes')
export class QuizController {
  public constructor(private readonly quizService: QuizService) {}

  @Get('/{:id}')
  public getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(Number(id));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public createQuiz(@Body() quizDTO: CreateQuizDTO) {
    return this.quizService.createQuiz(quizDTO);
  }

  @Get('/subject/{:subjectId}')
  public genarateQuizQuestionsIA(IAQuestionsDTO: any) {
    const { lessonId } = IAQuestionsDTO;

    return this.quizService.generateQuestionsIA(lessonId);
  }

  @Post('/submit')
  public processQuizSubmission(@Body() submissionDTO: SubmitQuizDTO) {
    return this.quizService.processQuizSubmission(submissionDTO);
  }

  @Post('/{:id}/results')
  public getQuizResults(@Param(':id') id, @Body() quizResultDTO: any) {
    return this.quizService.getQuizResult(quizResultDTO.studentId, Number(id));
  }

  public getQuizAnalytics(quizAnalyticsDTO: any) {
    const { quizId, subjectId } = quizAnalyticsDTO;
  }

  public getStudentQuizAnalytics(studentQuizAnalyticsDTO: any) {
    const { studentId, quizId } = studentQuizAnalyticsDTO;
  }

  public getQuizPerformanceBySubject(quizPerformanceDTO: any) {
    const { subjectId } = quizPerformanceDTO;
  }

  public getStudentSubjectPerformance(studentPerformanceDTO: any) {
    const { studentId, subjectId } = studentPerformanceDTO;
  }
}
