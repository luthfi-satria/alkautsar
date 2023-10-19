import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { OrderDocuments } from './entities/order.entities';
import { OrderDetailDocuments } from './entities/order.details.entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDocuments, OrderDetailDocuments]),
    AppconfigModule,
    CartModule,
    ProductModule,
  ],
  exports: [OrderService],
  providers: [OrderService, ResponseService, MessageService, JwtService],
  controllers: [OrderController],
})
export class OrderModule {}
