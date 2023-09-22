import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestorDocuments } from './../database/entities/investor.entities';
import { UserProfileDocuments } from '../database/entities/profile.entities';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { InvestorService } from './investor.service';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { InvestorController } from './investor.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvestorDocuments, UserProfileDocuments]),
    AppconfigModule,
    UsersModule,
  ],
  exports: [InvestorService],
  providers: [InvestorService, ResponseService, MessageService, JwtService],
  controllers: [InvestorController],
})
export class InvestorModule {}
