import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      transform:true,
      transformOptions:{
        enableImplicitConversion:true
      },
      // forbidUnknownValues: false
    })
  )
  app.use(cookieParser())
  // app.enableCors({
  //   origin:"http://localhost:clientapp_port",
  //   credentials:true // so we dont need passtrough param in every request
  // })
  await app.listen(3000);
}
bootstrap();
