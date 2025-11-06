import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('='.repeat(70));
  console.log(`🚀 Backend API is running on: http://localhost:${port}`);
  console.log(`📊 API Docs: http://localhost:${port}/api/v1`);
  console.log(`🗄️  Database: Connected to PostgreSQL`);
  console.log('='.repeat(70));
}

bootstrap();