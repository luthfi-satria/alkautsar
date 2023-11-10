import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { OmsetDocument } from './entities/omset.entities';
import { OrderModule } from '../order/order.module';
import { KreditModule } from '../kredit/kredit.module';
import { OmsetService } from './omset.service';
import { OmsetController } from './omset.controller';
import { InvestorModule } from '../investor/investor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OmsetDocument]),
    AppconfigModule,
    OrderModule,
    KreditModule,
    InvestorModule,
  ],
  exports: [OmsetService],
  providers: [OmsetService, ResponseService, MessageService, JwtService],
  controllers: [OmsetController],
})
export class OmsetModule {}
