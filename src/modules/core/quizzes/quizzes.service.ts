import { IntegrationIAService } from '@modules/shared';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class QuizService {
  constructor(
    @Inject(IntegrationIAService)
    private readonly integrationIAService: IntegrationIAService,
  ) {}

  private generateFeedback(quizId: string, studentId: string) {}
}
