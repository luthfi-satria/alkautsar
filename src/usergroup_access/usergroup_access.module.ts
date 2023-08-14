import { Module } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AppconfigModule } from '../appconfig/appconfig.module';
import { AccessDocument } from '../database/entities/usergroup_access.entity';
import { UsergroupAccessService } from './usergroup_access.service';
import { UsergroupAccessController } from './usergroup_access.controller';
import { UsergroupDocument } from '../database/entities/usergroup.entity';
import { AppmenusDocument } from '../database/entities/menus.entity';
import { UsergroupModule } from '../usergroup/usergroup.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessDocument,
      UsergroupDocument,
      AppmenusDocument,
    ]),
    AppconfigModule,
    UsergroupModule,
  ],
  providers: [
    UsergroupAccessService,
    MessageService,
    ResponseService,
    JwtService,
  ],
  controllers: [UsergroupAccessController],
  exports: [UsergroupAccessService],
})
export class UsergroupAccessModule {}
