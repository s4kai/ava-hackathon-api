import { Global, Module } from '@nestjs/common';
import { IntegrationIAProvider } from './ia';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [],
  providers: [PrismaService, IntegrationIAProvider],
  exports: [PrismaService, IntegrationIAProvider],
})
export class SharedModule {}
