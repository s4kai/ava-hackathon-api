import { Module } from '@nestjs/common';
import { StudentsController, StudentsService } from './students';
import { SubjectController, SubjectService } from './subjects';

@Module({
  imports: [],
  controllers: [StudentsController, SubjectController],
  providers: [StudentsService, SubjectService],
  exports: [],
})
export class CoreModule {}
