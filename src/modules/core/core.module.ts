import { Module } from '@nestjs/common';
import { LessonController, LessonService } from './lessons';
import { StudentsController, StudentsService } from './students';
import { SubjectController, SubjectService } from './subjects';

const controllers = [StudentsController, SubjectController, LessonController];
const providers = [StudentsService, SubjectService, LessonService];

@Module({
  imports: [],
  controllers,
  providers,
  exports: [],
})
export class CoreModule {}
