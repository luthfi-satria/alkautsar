import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UserDocuments } from '../database/entities/users.entity';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { UsergroupDocument } from '../database/entities/usergroup.entity';
import { AppconfigModule } from '../appconfig/appconfig.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDocuments, UsergroupDocument]),
    AppconfigModule,
  ],
  exports: [UsersService],
  providers: [UsersService, ResponseService, MessageService, JwtService],
  controllers: [UsersController],
})
export class UsersModule {}
