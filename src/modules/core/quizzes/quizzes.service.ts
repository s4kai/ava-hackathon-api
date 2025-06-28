import { IntegrationIAService, PrismaService } from '@modules/shared';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { StudentsService } from '../students';
import { QuizFeedback } from './dto/feedbackDTO';
import { CreateQuizDTO } from './dto/request/createQuizDTO';
import { SubmitQuizDTO } from './dto/request/submitQuizDTO';
import { CustomMaterialService } from '../custom-material';

@Injectable()
export class QuizService {
  constructor(
    @Inject(IntegrationIAService)
    private readonly integrationIAService: IntegrationIAService,
    private readonly prismaService: PrismaService,
    private readonly studentService: StudentsService,

    @Inject(forwardRef(() => CustomMaterialService))
    private readonly customMaterialService: CustomMaterialService,
  ) {}

  public async getQuizzesBySubject(subjectId: number) {
    return await this.prismaService.lessonQuiz.findMany({
      where: { lesson: { subjectId } },
    });
  }

  public async getQuizById(quizId: number) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { id: quizId },
      include: { QuizQuestion: true },
    });

    if (!quiz) {
      throw new BadRequestException(`Quiz with ID ${quizId} does not exist.`);
    }

    return quiz;
  }

  public async createQuiz(quizDTO: CreateQuizDTO) {
    const { title, lessonId, description, timeLimit, questions } = quizDTO;

    const lesson = await this.prismaService.lesson.findUnique({
      where: { id: Number(lessonId) },
    });

    if (!lesson) {
      throw new BadRequestException(
        `Lesson with ID ${lessonId} does not exist.`,
      );
    }

    return await this.prismaService.lessonQuiz.create({
      data: {
        title,
        lessonId,
        description,
        maxScore: questions.length,
        timeLimit,
        QuizQuestion: {
          create: questions.map((q) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.correctAnswer,
            type: q.type,
            explanation: q.explanation,
          })),
        },
      },
    });
  }

  public async processQuizSubmission(submitDto: SubmitQuizDTO) {
    const { quizId, studentId, answers } = submitDto;

    const quiz = await this.getQuizById(quizId);

    if (quiz.QuizQuestion.length !== answers.length) {
      throw new BadRequestException(
        `Number of answers does not match quiz questions.`,
      );
    }

    const existingAnswer = await this.prismaService.studentQuizAnswer.findFirst(
      {
        where: { quizId, studentId },
      },
    );

    if (existingAnswer) {
      throw new BadRequestException(`Quiz already answered by student.`);
    }

    await this.prismaService.studentQuizAnswer.create({
      data: {
        quizId,
        studentId,
        answer: JSON.stringify(answers),
      },
    });

    let feedback: QuizFeedback[] = [];
    let score = 0;

    for (const response of answers) {
      const question = quiz.QuizQuestion.find(
        (q) => q.id === response.questionId,
      );
      if (!question) {
        throw new BadRequestException(
          `Invalid question ID: ${response.questionId}`,
        );
      }

      if (question.answer === response.answer) {
        score++;
      } else {
        feedback.push({
          questionId: response.questionId,
          questionText: question.question,
          options: JSON.parse(question.options),
          correctAnswer: question.answer,
          studentAnswer: response.answer,
        });
      }
    }

    const result = await this.prismaService.studentQuizResult.create({
      data: {
        quizId,
        studentId,
        score,
        timeTaken: 0,
      },
    });

    const aiFeedback = await this.generateFeedback(feedback, result.id);

    const customMaterial =
      await this.customMaterialService.createCustomMaterial(
        aiFeedback,
        studentId,
        quizId,
      );

    return {
      ...result,
      feedback: aiFeedback,
      customMaterialId: customMaterial.id,
    };
  }

  public async generateQuestionsIA(lessonId: number) {
    const lesson = await this.prismaService.lesson.findUnique({
      where: { id: lessonId },
      include: { lessonPlan: true },
    });

    if (!lesson) {
      throw new BadRequestException(
        `Lesson with ID ${lessonId} does not exist.`,
      );
    }

    const prompt = `
      Você é um professor universitário experiente.
      Gere 5 perguntas de múltipla escolha sobre: "${lesson.title}"
    `;

    const context = `
      Plano da Lição:
      Título: ${lesson.lessonPlan?.title}
      Conteúdo: ${lesson.lessonPlan?.content}
    `;

    const format = `
      [
        {
          "question": string,
          "options": string[],
          "correctAnswer": number,
          "type": "multiple-choice",
          "explanation": string
        }
      ]
    `;

    return await this.integrationIAService.getResponseWithFormat(
      prompt,
      context,
      format,
    );
  }

  public async getQuizResult(quizId: number, studentId: number) {
    const result = await this.prismaService.studentQuizResult.findFirst({
      where: { quizId, studentId },
      include: {
        quiz: {
          include: { QuizQuestion: true },
        },
      },
    });

    if (!result) {
      throw new BadRequestException(
        `No result found for quiz ${quizId} and student ${studentId}`,
      );
    }

    return result;
  }

  private async generateFeedback(
    quizFeedbacks: QuizFeedback[],
    resultId: number,
  ) {
    const prompt = `
      Analise essas perguntas: ${JSON.stringify(quizFeedbacks)}.
      Gere feedback educativo para o aluno.
    `;

    const response = await this.integrationIAService.getResponseFromIA(prompt);

    await this.prismaService.studentQuizResult.update({
      where: { id: resultId },
      data: { feedback: JSON.stringify(response) },
    });

    return response;
  }

  public async getQuizAnalytics(quizId: number) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { id: quizId },
      include: { StudentQuizResult: true },
    });

    if (!quiz) {
      throw new BadRequestException(`Quiz with ID ${quizId} does not exist.`);
    }

    const results = quiz.StudentQuizResult;

    if (!results.length) {
      return {
        quizId: quiz.id,
        title: quiz.title,
        totalSubmissions: 0,
        averageScore: 0,
        percentageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeTaken: 0,
      };
    }

    const scores = results.map((r) => r.score);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const totalTimeTaken = results.reduce((a, b) => a + b.timeTaken, 0);

    return {
      quizId: quiz.id,
      title: quiz.title,
      totalSubmissions: results.length,
      averageScore: totalScore / results.length,
      percentageScore:
        quiz.maxScore > 0
          ? (totalScore / (results.length * quiz.maxScore)) * 100
          : 0,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageTimeTaken: totalTimeTaken / results.length,
    };
  }

  public async getQuizAnalyticsBySubject(subjectId: number) {
    const quizzes = await this.getQuizzesBySubject(subjectId);

    if (!quizzes.length) {
      throw new BadRequestException(`No quizzes for subject ID ${subjectId}.`);
    }

    const analytics = await Promise.all(
      quizzes.map((q) => this.getQuizAnalytics(q.id)),
    );

    return {
      subjectId,
      totalQuizzes: analytics.length,
      averageScore: this.average(analytics.map((a) => a.averageScore)),
      averagePercentageScore: this.average(
        analytics.map((a) => a.percentageScore),
      ),
      totalSubmissions: analytics.reduce(
        (sum, a) => sum + a.totalSubmissions,
        0,
      ),
      avgTimeTaken: this.average(analytics.map((a) => a.averageTimeTaken)),
      highestScore: Math.max(...analytics.map((a) => a.highestScore)),
      lowestScore: Math.min(...analytics.map((a) => a.lowestScore)),
      quizzes: analytics,
    };
  }

  public async getStudentSubjectQuizAnalytics(
    studentId: number,
    subjectId: number,
  ) {
    const quizzes = await this.getQuizzesBySubject(subjectId);

    if (!quizzes.length) {
      throw new BadRequestException(
        `No quizzes found for subject ID ${subjectId}.`,
      );
    }

    const student = await this.studentService.getStudentById(studentId);

    const quizIdToQuizMap = new Map(quizzes.map((q) => [q.id, q]));
    const quizResults = await this.prismaService.studentQuizResult.findMany({
      where: {
        studentId,
        quizId: { in: quizzes.map((q) => q.id) },
      },
      select: {
        quizId: true,
        score: true,
        timeTaken: true,
        feedback: true,
      },
    });

    if (!quizResults.length) {
      return {
        studentId,
        student,
        totalQuizzes: 0,
        averageScore: 0,
        averageTimeTaken: 0,
        percentageScore: 0,
        totalScore: 0,
        totalTimeTaken: 0,
      };
    }

    const totalScore = quizResults.reduce((sum, r) => sum + r.score, 0);
    const totalTimeTaken = quizResults.reduce((sum, r) => sum + r.timeTaken, 0);
    const totalMaxScore = quizResults.reduce(
      (sum, r) => sum + (quizIdToQuizMap.get(r.quizId)?.maxScore || 0),
      0,
    );

    return {
      studentId,
      student,
      totalQuizzes: quizResults.length,
      averageScore: totalScore / quizResults.length,
      averageTimeTaken: totalTimeTaken / quizResults.length,
      percentageScore:
        totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0,
      totalScore,
      totalTimeTaken,
    };
  }

  public async getStudentsQuizAnalytics(subjectId: number) {
    const students = await this.studentService.getAllStudents({
      where: {
        StudentSubject: { some: { subjectId } },
      },
    });

    if (!students.length) {
      throw new BadRequestException(
        `No students found for subject ID ${subjectId}.`,
      );
    }

    const analytics = await Promise.all(
      students.map((s) => this.getStudentSubjectQuizAnalytics(s.id, subjectId)),
    );

    return {
      subjectId,
      students: analytics,
    };
  }

  public async getRecentStudentsResults(subjectId: number, limit = 10) {
    const quizzes = await this.getQuizzesBySubject(subjectId);
    if (!quizzes.length) {
      throw new BadRequestException(`No quizzes for subject ID ${subjectId}.`);
    }

    const results = await this.prismaService.studentQuizResult.findMany({
      where: {
        quizId: { in: quizzes.map((q) => q.id) },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { student: true, quiz: true },
    });

    return results.map((r) => ({
      studentId: r.student.id,
      studentName: r.student.name,
      quizId: r.quiz.id,
      quizTitle: r.quiz.title,
      score: r.score,
      percentageScore:
        r.quiz.maxScore > 0 ? (r.score / r.quiz.maxScore) * 100 : 0,
      timeTaken: r.timeTaken,
      createdAt: r.createdAt,
    }));
  }

  private average(values: number[]) {
    return values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  }
}
