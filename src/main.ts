import { config } from 'dotenv';
config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir el directorio de archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'assets', 'signatories'), {
    prefix: '/assets/signatories',
  });

  app.useStaticAssets(join(__dirname, '..', 'assets', 'providers-logos'), {
    prefix: '/assets/providers-logos',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['https://ramazzini.app', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
  });

  // Escuchar puerto dinámico o 3000
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
