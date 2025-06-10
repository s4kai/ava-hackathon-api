import { Module } from '@nestjs/common';
import { SharedModule } from './modules/shared';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
