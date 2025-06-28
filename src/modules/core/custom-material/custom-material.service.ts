import { IntegrationIAService, PrismaService } from '@modules/shared';
import { Inject, Injectable } from '@nestjs/common';
import { QuizService } from '../quizzes';

@Injectable()
export class CustomMaterialService {
  constructor(
    @Inject(IntegrationIAService)
    private readonly integrationIAService: IntegrationIAService,
    private readonly quizService: QuizService,
    private readonly prismaService: PrismaService,
  ) {}

  public async createCustomMaterial(
    feedback: string,
    studentId: number,
    quizId: number,
  ) {
    const prompt = `Com base no feedback abaixo gere um material customizado para o aluno,
    com dicas de estudo e os pontos que ele deve focar. Gere um titulo e um conteudo o conteudo deve ser
    formato markdown.
    `;

    const format = `
      {
        title: string,
        content: string(markdown)
      }
    `;

    const newMaterial = await this.integrationIAService.getResponseWithFormat(
      prompt,
      feedback,
      format,
    );

    const { title, content } = JSON.parse(format);

    const quiz = await this.quizService.getQuizById(quizId);

    await this.prismaService.studentCustomMaterial.create({
      data: {
        title: title as string,
        content: content as string,
        studentId,
        lessonId: quiz.lessonId,
      },
    });
  }
}
