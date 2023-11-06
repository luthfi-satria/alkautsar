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
import { KreditPaymentDocument } from './entities/kredit_payment.entities';
import { HistoryKreditController } from '../history_kredit/history_kredit.controller';
import { HistoryKreditService } from './../history_kredit/history_kredit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KreditDocument,
      KreditSupportDocument,
      KreditPaymentDocument,
    ]),
    AppconfigModule,
    UsersModule,
  ],
  exports: [KreditService, HistoryKreditService],
  providers: [
    KreditService,
    ResponseService,
    MessageService,
    JwtService,
    HistoryKreditService,
  ],
  controllers: [KreditController, HistoryKreditController],
})
export class KreditModule {}
