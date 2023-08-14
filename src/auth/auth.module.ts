import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { HashService } from '../hash/hash.service';
import { JwtStrategy } from '../hash/guard/jwt/jwt.strategy';
import { AppconfigModule } from '../appconfig/appconfig.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: () => {
        return {
          secret: process.env.AUTH_JWTSECRETKEY,
          signOptions: {
            expiresIn: process.env.AUTH_JWTEXPIRATIONTIME,
          },
        };
      },
    }),
    UsersModule,
    AppconfigModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [
    AuthService,
    MessageService,
    ResponseService,
    HashService,
    JwtStrategy,
  ],
})
export class AuthModule {}
