import { Module } from '@nestjs/common';
import { CoreModule, SharedModule } from './modules/';

@Module({
  imports: [SharedModule, CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
