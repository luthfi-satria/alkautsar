import { Module } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AppmenusDocument } from '../database/entities/menus.entity';
import { AppmenuService } from './appmenu.service';
import { AppmenuController } from './appmenu.controller';
import { AppconfigModule } from '../appconfig/appconfig.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppmenusDocument]), AppconfigModule],
  providers: [AppmenuService, MessageService, ResponseService, JwtService],
  controllers: [AppmenuController],
  exports: [AppmenuService],
})
export class AppmenuModule {}
