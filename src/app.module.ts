import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsergroupModule } from './usergroup/usergroup.module';
import { UsergroupAccessModule } from './usergroup_access/usergroup_access.module';
import { CommandModule } from 'nestjs-command';
import { SeedingDB } from './database/seeds/seedings.seed';
import { AppmenuModule } from './appmenu/appmenu.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedullerService } from './scheduller/scheduller.service';
import { AppconfigModule } from './appconfig/appconfig.module';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestorModule } from './investor/investor.module';
import { CategoryModule } from './categories/categories.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { KreditModule } from './kredit/kredit.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OmsetModule } from './omset/omset.module';
import { WishlistModule } from './wishlist/wishlist.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseService,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ScheduleModule.forRoot(),
    CommandModule,
    UsersModule,
    AuthModule,
    UsergroupModule,
    UsergroupAccessModule,
    AppmenuModule,
    AppconfigModule,
    InvestorModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    KreditModule,
    DashboardModule,
    OmsetModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedingDB, SchedullerService],
})
export class AppModule {}
