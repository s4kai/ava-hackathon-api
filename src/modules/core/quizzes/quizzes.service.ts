import { IntegrationIAService, PrismaService } from '@modules/shared';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { StudentsService } from '../students';
import { QuizFeedback } from './dto/feedbackDTO';
import { CreateQuizDTO } from './dto/request/createQuizDTO';
import { SubmitQuizDTO } from './dto/request/submitQuizDTO';

@Injectable()
export class QuizService {
  constructor(
    @Inject(IntegrationIAService)
    private readonly integrationIAService: IntegrationIAService,
    private readonly prismaService: PrismaService,
    private readonly studentService: StudentsService,
  ) {}

  public async getQuizzesBySubject(subjectId: number) {
    // Logic to fetch quizzes by subject`
    const lessons = await this.prismaService.lesson.findMany({
      where: {
        subjectId,
      },
      select: { id: true },
    });

    if (!lessons) {
      throw new BadRequestException(
        `Lessons with this Subject ID ${subjectId} does not exists`,
      );
    }

    return await this.prismaService.lessonQuiz.findMany({
      where: {
        lesson: {
          id: {
            in: lessons.map((lesson) => lesson.id),
          },
        },
      },
    });
  }

  public async getQuizById(quizId: number) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        QuizQuestion: true,
      },
    });

    if (!quiz) {
      throw new BadRequestException(`Quiz with ID ${quizId} does not exist.`);
    }

    return quiz;
  }

  public async createQuiz(quizDTO: CreateQuizDTO) {
    const { title, lessonId, description, timeLimit, questions } = quizDTO;

    // Validate the lesson exists
    const lesson = await this.prismaService.lesson.findUnique({
      where: { id: Number(lessonId) },
    });

    if (!lesson) {
      throw new BadRequestException(
        `Lesson with ID ${lessonId} does not exist.`,
      );
    }

    // Create the quiz
    return await this.prismaService.lessonQuiz.create({
      data: {
        title,
        lessonId,
        description,
        maxScore: questions.length,
        timeLimit,
        QuizQuestion: {
          create: questions.map((question) => ({
            question: question.question,
            options: JSON.stringify(question.options),
            answer: question.correctAnswer,
            type: question.type,
            explanation: question.explanation,
          })),
        },
      },
    });
  }

  public async processQuizSubmission(submitDto: SubmitQuizDTO) {
    const { quizId, studentId, answers } = submitDto;

    // Validate the quiz exists
    const quiz = await this.getQuizById(quizId);
    if (!quiz) {
      throw new BadRequestException(`Quiz with ID ${quizId} does not exist.`);
    }

    for (const answer of answers) {
      if (!quiz.QuizQuestion.some((q) => q.id === answer.questionId)) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} does not exist in quiz ${quizId}.`,
        );
      }
    }

    const answer = await this.prismaService.studentQuizAnswer.findFirst({
      where: {
        quizId,
        studentId,
      },
    });

    if (answer) {
      throw new BadRequestException(
        `Student with ID ${studentId} has already submitted answers for quiz ${quizId}.`,
      );
    }

    await this.prismaService.studentQuizAnswer.create({
      data: {
        quizId,
        studentId,
        answer: JSON.stringify(answers),
      },
    });

    // Calculate the score

    let feedback: QuizFeedback[] = [];
    let score = 0;

    for (const response of answers) {
      const question = quiz.QuizQuestion.find(
        (q) => q.id === response.questionId,
      );

      if (!question) {
        throw new BadRequestException(
          `Question with ID ${response.questionId} not found in quiz ${quizId}.`,
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

    const studentResult = await this.prismaService.studentQuizResult.create({
      data: {
        quizId,
        studentId,
        score,
        timeTaken: 0,
      },
    });

    this.generateFeedback(feedback, studentResult.id);

    return studentResult;
  }

  public async generateQuestionsIA(lessonId: number) {
    const lesson = await this.prismaService.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new BadRequestException(
        `Lesson with ID ${lessonId} does not exist.`,
      );
    }

    const prompt = `Generate quiz questions for the lesson titled "${lesson.title}".
      The questions should be diverse in type (multiple choice, true/false, etc.) and cover the key concepts of the lesson.
      Provide at least 5 questions with options and correct answers.`;

    const response = await this.integrationIAService.getResponseFromIA(prompt);
    return response;
  }

  public async getQuizResult(quizId: number, studentId: number) {
    const quizResult = await this.prismaService.studentQuizResult.findFirst({
      where: {
        quizId,
        studentId,
      },
      include: {
        quiz: {
          include: {
            QuizQuestion: true,
          },
        },
      },
    });

    if (!quizResult) {
      throw new BadRequestException(
        `No results found for quiz ID ${quizId} and student ID ${studentId}.`,
      );
    }

    return quizResult;
  }

  private async generateFeedback(
    QuizFeedbacks: QuizFeedback[],
    studentResultId: number,
  ) {
    const prompt = `Generate feedback for the following quiz questions: ${JSON.stringify(
      QuizFeedbacks,
    )}. 
      The feedback should include the question text, options, correct answer, and the student's answer.
      return the feedback in a structured format suitable for a student to understand their mistakes and
      learn from them. The feedback should be concise and educational.
    `;

    const response = await this.integrationIAService.getResponseFromIA(prompt);

    await this.prismaService.studentQuizResult.update({
      where: { id: studentResultId },
      data: {
        feedback: JSON.stringify(response),
      },
    });

    return response;
  }

  public async getQuizAnalytics(quizId: number) {
    const quiz = await this.prismaService.lessonQuiz.findUnique({
      where: { id: quizId },
      include: {
        QuizQuestion: true,
        StudentQuizResult: {
          include: {
            student: true,
          },
        },

        QuizAnalysis: true,
      },
    });

    if (!quiz) {
      throw new BadRequestException(`Quiz with ID ${quizId} does not exist.`);
    }

    if (
      quiz.QuizAnalysis &&
      quiz.QuizAnalysis.createdAt.getTime() > Date.now() - 1 * 60 * 1000
    ) {
      return {
        quizId: quiz.id,
        title: quiz.title,
        totalSubmissions: quiz.StudentQuizResult.length,
        averageScore: quiz.QuizAnalysis.averageScore,
        percentageScore: (quiz.QuizAnalysis.averageScore / quiz.maxScore) * 100,
        highestScore: quiz.QuizAnalysis.highestScore,
        lowestScore: quiz.QuizAnalysis.lowestScore,
        averageTimeTaken: quiz.QuizAnalysis.averageTimeTaken,
      };
    }

    const totalSubmissions = quiz.StudentQuizResult.length;

    const totalTimeTaken = quiz.StudentQuizResult.reduce(
      (sum, result) => sum + result.timeTaken,
      0,
    );

    const totalScore = quiz.StudentQuizResult.reduce(
      (sum, result) => sum + result.score,
      0,
    );

    const averageTimeTaken =
      totalSubmissions > 0 ? totalTimeTaken / totalSubmissions : 0;

    const averageScore =
      totalSubmissions > 0 ? totalScore / totalSubmissions : 0;

    const percentageScore = (averageScore / quiz.maxScore) * 100;

    const highestScore =
      totalSubmissions > 0
        ? Math.max(...quiz.StudentQuizResult.map((result) => result.score))
        : 0;

    const lowestScore =
      totalSubmissions > 0
        ? Math.min(...quiz.StudentQuizResult.map((result) => result.score))
        : 0;

    if (isNaN(percentageScore)) {
      throw new BadRequestException(
        `Unable to calculate percentage score for quiz ID ${quizId}.`,
      );
    }

    await this.prismaService.quizAnalysis.upsert({
      where: {
        quizId: quiz.id,
      },

      update: {
        totalAttempts: totalSubmissions,
        averageTimeTaken,
        averageScore,
        highestScore,
        lowestScore,
      },

      create: {
        quiz: {
          connect: { id: quiz.id },
        },
        totalAttempts: totalSubmissions,
        averageTimeTaken,
        averageScore,
        highestScore,
        lowestScore,
      },
    });

    return {
      quizId: quiz.id,
      title: quiz.title,
      totalSubmissions,
      averageScore,
      percentageScore,
      highestScore,
      lowestScore,
      averageTimeTaken,
    };
  }

  public async getQuizAnalyticsBySubject(subjectId: number) {
    const quizzes = await this.getQuizzesBySubject(subjectId);

    if (!quizzes || quizzes.length === 0) {
      throw new BadRequestException(
        `No quizzes found for subject ID ${subjectId}.`,
      );
    }

    const analytics = await Promise.all(
      quizzes.map((quiz) => this.getQuizAnalytics(quiz.id)),
    );

    const subjectAnalytics = {
      subjectId,
      quizzes: analytics,
      totalQuizzes: analytics.length,
      averageScore:
        analytics.reduce((sum, quiz) => sum + quiz.averageScore, 0) /
        analytics.length,
      totalSubmissions: analytics.reduce(
        (sum, quiz) => sum + quiz.totalSubmissions,
        0,
      ),
      averagePercentageScore:
        analytics.reduce((sum, quiz) => sum + quiz.percentageScore, 0) /
        analytics.length,

      avgTimeTaken:
        analytics.reduce((sum, quiz) => sum + quiz.averageTimeTaken, 0) /
        analytics.length,
      highestScore: Math.max(...analytics.map((quiz) => quiz.highestScore)),
      lowestScore: Math.min(...analytics.map((quiz) => quiz.lowestScore)),
    };

    return subjectAnalytics;
  }

  public async getStudentSubjectQuizAnalytics(
    studentId: number,
    subjectId: number,
  ) {
    const quizzes = await this.getQuizzesBySubject(subjectId);

    if (!quizzes || quizzes.length === 0) {
      throw new BadRequestException(
        `No quizzes found for subject ID ${subjectId}.`,
      );
    }

    const student = await this.studentService.getStudentById(studentId);

    const studentAnalytics = await Promise.all(
      quizzes.map(async (quiz) => {
        const result = await this.getQuizResult(quiz.id, studentId);

        return {
          quizId: quiz.id,
          title: quiz.title,
          score: result.score,
          timeTaken: result.timeTaken,
          feedback: JSON.parse(result.feedback || '[]'),
        };
      }),
    );

    const totalQuizzes = studentAnalytics.length;

    const totalScore = studentAnalytics.reduce(
      (sum, quiz) => sum + quiz.score,
      0,
    );

    const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

    const totalTimeTaken = studentAnalytics.reduce(
      (sum, quiz) => sum + quiz.timeTaken,
      0,
    );

    const averageTimeTaken =
      totalQuizzes > 0 ? totalTimeTaken / totalQuizzes : 0;

    const highestScore =
      totalQuizzes > 0
        ? Math.max(...studentAnalytics.map((quiz) => quiz.score))
        : 0;

    const lowestScore =
      totalQuizzes > 0
        ? Math.min(...studentAnalytics.map((quiz) => quiz.score))
        : 0;

    const percentageScore =
      quizzes.reduce((sum, quiz) => sum + quiz.maxScore, 0) > 0
        ? (totalScore / quizzes.reduce((sum, quiz) => sum + quiz.maxScore, 0)) *
          100
        : 0;

    return {
      studentId,
      student,
      totalQuizzes,
      averageScore,
      averageTimeTaken,
      percentageScore,
      totalScore,
      totalTimeTaken,
    };
  }

  public async getStudentsQuizAnalytics(subjectId: number) {
    const sudents = await this.studentService.getAllStudents({
      where: {
        StudentSubject: {
          some: {
            subjectId,
          },
        },
      },
    });

    if (!sudents || sudents.length === 0) {
      throw new BadRequestException(
        `No students found for subject ID ${subjectId}.`,
      );
    }

    const analytics = await Promise.all(
      sudents.map((student) =>
        this.getStudentSubjectQuizAnalytics(student.id, subjectId),
      ),
    );

    return {
      subjectId,
      students: analytics,
    };
  }

  public async getRecentStudentsResults(subjectId: number, limit: number = 10) {
    const quizzes = await this.getQuizzesBySubject(subjectId);

    if (!quizzes || quizzes.length === 0) {
      throw new BadRequestException(
        `No quizzes found for subject ID ${subjectId}.`,
      );
    }

    const results = await this.prismaService.studentQuizResult.findMany({
      where: {
        quizId: {
          in: quizzes.map((quiz) => quiz.id),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
      include: {
        student: true,
        quiz: true,
      },
    });

    return results.map((result) => ({
      studentId: result.student.id,
      studentName: result.student.name,
      quizId: result.quiz.id,
      quizTitle: result.quiz.title,
      score: result.score,
      percentageScore: (result.score / result.quiz.maxScore) * 100,
      timeTaken: result.timeTaken,
      createdAt: result.createdAt,
    }));
  }
}
