import { Controller } from '@nestjs/common';
import { QuizService } from './quizzes.service';

@Controller('quizzes')
export class QuizController {
  public constructor(private readonly quizService: QuizService) {}

  public getQuizzesBySubject(subjectId: string) {}
  public getQuizzesByLesson(lessonId: string) {}
  public getQuizById(id: string) {}

  public createQuiz(quizDTO: any) {}

  public genarateQuizQuestionsIA(IAQuestionsDTO: any) {
    const { lessonId } = IAQuestionsDTO;
  }

  public processQuizSubmission(submissionDTO: any) {
    const { quizId, answers, studentId } = submissionDTO;
  }

  public getQuizResults(quizResultDTO: any) {
    const { quizId, studentId } = quizResultDTO;
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
