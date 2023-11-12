import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { WishlistDocument } from './entities/wishlist.entities';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { CartDocuments } from '../cart/entities/cart.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([WishlistDocument, CartDocuments]),
    AppconfigModule,
  ],
  exports: [WishlistService],
  providers: [WishlistService, ResponseService, MessageService, JwtService],
  controllers: [WishlistController],
})
export class WishlistModule {}
