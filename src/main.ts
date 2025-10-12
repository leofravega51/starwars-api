import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { PORT } from './shared/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Star Wars API')
    .setDescription('API para gestión de películas de Star Wars con autenticación JWT')
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints de autenticación y gestión de usuarios')
    .addTag('Films', 'Endpoints para gestión de películas de Star Wars')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Star Wars API Docs'
  });

  console.log(`🚀 Server running on http://localhost:${PORT || 3000}`);
  console.log(`📚 Swagger documentation available at http://localhost:${PORT || 3000}/api/docs`);

  await app.listen(PORT || 3000);
}
bootstrap();
