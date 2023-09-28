import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { CategoryService } from './categories.service';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { CategoryController } from './categories.controller';
import { CategoryDocuments } from '../database/entities/categories.entities';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryDocuments]), AppconfigModule],
  exports: [CategoryService],
  providers: [CategoryService, ResponseService, MessageService, JwtService],
  controllers: [CategoryController],
})
export class CategoryModule {}
