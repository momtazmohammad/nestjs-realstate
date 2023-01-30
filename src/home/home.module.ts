import { Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import {APP_INTERCEPTOR} from "@nestjs/core"
@Module({
  imports:[PrismaModule],
  controllers: [HomeController],
  providers: [HomeService,{
    provide:APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor //change the reponse base on Dto
  }]
})
export class HomeModule {}
