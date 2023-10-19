import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { CartDocuments } from './entities/cart.entities';

@Module({
  imports: [TypeOrmModule.forFeature([CartDocuments]), AppconfigModule],
  exports: [CartService],
  providers: [CartService, ResponseService, MessageService, JwtService],
  controllers: [CartController],
})
export class CartModule {}
