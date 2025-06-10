import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ prefix: config.appName }),
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.port);
}
bootstrap();
