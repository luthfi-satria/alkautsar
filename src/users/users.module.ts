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
import { UserProfileDocuments } from '../database/entities/profile.entities';
import { PerekomendasiDocument } from '../database/entities/perekomendasi.entities';
import { UserPerekomendasiService } from './usersPerekomendasi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDocuments,
      UserProfileDocuments,
      UsergroupDocument,
      PerekomendasiDocument,
    ]),
    AppconfigModule,
  ],
  exports: [UsersService],
  providers: [
    UsersService,
    UserPerekomendasiService,
    ResponseService,
    MessageService,
    JwtService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
