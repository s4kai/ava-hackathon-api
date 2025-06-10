import { Module } from '@nestjs/common';
import {
  CustomMaterialController,
  CustomMaterialService,
} from './custom-material';
import { LessonController, LessonService } from './lessons';
import { QuizController, QuizService } from './quizzes';
import { StudentsController, StudentsService } from './students';
import { SubjectController, SubjectService } from './subjects';

const controllers = [
  StudentsController,
  SubjectController,
  LessonController,
  QuizController,
  CustomMaterialController,
];

const providers = [
  StudentsService,
  SubjectService,
  LessonService,
  QuizService,
  CustomMaterialService,
];

@Module({
  imports: [],
  controllers,
  providers,
  exports: [],
})
export class CoreModule {}
