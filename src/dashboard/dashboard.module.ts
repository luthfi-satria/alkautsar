import { Module } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { JwtService } from '@nestjs/jwt';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { InvestorModule } from '../investor/investor.module';
import { KreditModule } from '../kredit/kredit.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    AppconfigModule,
    UsersModule,
    InvestorModule,
    KreditModule,
    OrderModule,
    ProductModule,
  ],
  providers: [MessageService, ResponseService, JwtService],
  controllers: [DashboardController],
  exports: [],
})
export class DashboardModule {}
