import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PORT } from './shared/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT || 3000);
}
bootstrap();
