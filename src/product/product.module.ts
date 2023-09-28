import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductDocuments } from '../database/entities/product.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductDocuments]), AppconfigModule],
  exports: [ProductService],
  providers: [ProductService, ResponseService, MessageService, JwtService],
  controllers: [ProductController],
})
export class ProductModule {}
