import { Module } from '@nestjs/common';
import { StudentsController, StudentsService } from './students';

@Module({
  imports: [],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [],
})
export class CoreModule {}
