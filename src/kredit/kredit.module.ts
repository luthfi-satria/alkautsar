import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import { KreditDocument } from './entities/kredit.entities';
import { KreditSupportDocument } from './entities/kredit_support.entities';
import { KreditService } from './kredit.service';
import { KreditController } from './kredit.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KreditDocument, KreditSupportDocument]),
    AppconfigModule,
    UsersModule,
  ],
  exports: [KreditService],
  providers: [KreditService, ResponseService, MessageService, JwtService],
  controllers: [KreditController],
})
export class KreditModule {}
