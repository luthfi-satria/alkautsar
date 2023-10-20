import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseService } from '../response/response.service';
import { AuthJwtGuard } from './auth.decorator';
import { RMessage } from '../response/response.interface';
import { ResponseStatusCode } from '../response/response.decorator';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';

@Controller('api/auth')
@UseInterceptors(AppconfigInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('login')
  @ResponseStatusCode()
  async login(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const dailytoken: string = await this.authService.createAccessToken(
      data.email,
      data.password,
    );
    if (!dailytoken || dailytoken == '') {
      const errors: RMessage = {
        value: '',
        property: 'token',
        constraint: ['Invalid token'],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }

    return this.responseService.success(true, 'Token successfully generated!', {
      token: dailytoken,
    });
  }

  @Get()
  async test() {
    return {
      test: 'test',
    };
  }

  @AuthJwtGuard()
  @Get('validate-token')
  @ResponseStatusCode()
  async validateToken(@Headers('Authorization') token: string): Promise<any> {
    token = token.replace('Bearer ', '');
    const payload: Record<string, any> =
      await this.authService.validateAccessToken(token);
    if (!payload) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: ['Invalid token'],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    return this.responseService.success(true, 'token is valid', {
      payload: {
        // id: payload?.id,
        username: payload?.username,
        level: payload?.level,
        photo: payload?.image ? `${payload.id}/photo/${payload.image}` : '',
      },
    });
  }
}
