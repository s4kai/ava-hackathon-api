import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database';
import { IntegrationIAProvider } from './ia';

@Global()
@Module({
  imports: [],
  providers: [PrismaService, IntegrationIAProvider],
  exports: [PrismaService, IntegrationIAProvider],
})
export class SharedModule {}
