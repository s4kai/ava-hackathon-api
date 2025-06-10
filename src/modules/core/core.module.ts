import { Module } from '@nestjs/common';
import { LessonController, LessonService } from './lessons';
import { QuizController, QuizService } from './quizzes';
import { StudentsController, StudentsService } from './students';
import { SubjectController, SubjectService } from './subjects';

const controllers = [
  StudentsController,
  SubjectController,
  LessonController,
  QuizController,
];

const providers = [StudentsService, SubjectService, LessonService, QuizService];

@Module({
  imports: [],
  controllers,
  providers,
  exports: [],
})
export class CoreModule {}
