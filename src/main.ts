import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { PORT, MONGODB_URI, NODE_ENV } from './shared/config';

async function bootstrap() {
  console.log('\n🔧 Iniciando Star Wars API...\n');
  
  // Verificar variables de entorno
  console.log('📋 Verificando configuración:');
  console.log(`   - Puerto: ${PORT || 3000}`);
  console.log(`   - Entorno: ${NODE_ENV || 'development'}`);
  console.log(`   - MongoDB URI: ${MONGODB_URI ? '✅ Configurado' : '❌ NO configurado'}`);
  
  if (!MONGODB_URI) {
    console.error('\n❌ ERROR: MONGODB_URI no está configurado en el archivo .env\n');
    process.exit(1);
  }

  console.log('\n🔌 Intentando conectar a MongoDB...\n');

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

  await app.listen(PORT || 3000);

  console.log('\n✨ Servidor iniciado correctamente:');
  console.log(`   🚀 Server: http://localhost:${PORT || 3000}`);
  console.log(`   📚 Swagger: http://localhost:${PORT || 3000}/api/docs\n`);
}
bootstrap();
