import { Module } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { JwtService } from '@nestjs/jwt';
import { AppconfigDocument } from '../database/entities/appconfig.entities';
import { AppconfigService } from './appconfig.service';
import { AppconfigController } from './appconfig.controller';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([AppconfigDocument]),
    BullModule.registerQueue({
      name: 'AppConfig',
    }),
  ],
  providers: [AppconfigService, MessageService, ResponseService, JwtService],
  controllers: [AppconfigController],
  exports: [AppconfigService],
})
export class AppconfigModule {}
