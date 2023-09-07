import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUsersDto,
  GetUserDetail,
  ListUser,
  UpdateUserDto,
} from './dto/users.dto';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { User } from '../auth/auth.decorator';
import { ResponseService } from '../response/response.service';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { updateProfileDto, updateRekomendasiDto } from './dto/profile.dto';
import { UserPerekomendasiService } from './usersPerekomendasi.service';

@Controller('api/user')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly rekomendasiService: UserPerekomendasiService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('register')
  @ResponseStatusCode()
  async register(@Body() payload: CreateUsersDto) {
    return this.userService.register(payload);
  }

  @Post('createAdmin')
  @ResponseStatusCode()
  async createAdmin() {
    return this.userService.createAdmin();
  }

  @Get()
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  async listUser(@Query() param: ListUser) {
    return await this.userService.listUser(param);
  }

  @Get('profile/:id')
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  async detail(@Param() user: GetUserDetail) {
    return await this.userService.profile(user.id);
  }

  @Get('profile')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async profile(@User() user: any) {
    return await this.userService.profile(user.id);
  }

  @Put('profile')
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async updateProfile(@User() user: any, @Body() body: updateProfileDto) {
    return await this.userService.update(user.id, body);
  }

  @Put('profile/:id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async update(@Param() param: GetUserDetail, @Body() body: UpdateUserDto) {
    return await this.userService.updateUserLogin(param.id, body);
  }

  /**
   * PEREKOMENDASI
   */
  @Get('perekomendasi')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async perekomendasi(@User() user: any) {
    return await this.rekomendasiService.perekomendasi(user.id);
  }

  @Put('perekomendasi')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async updatePerekomendasi(
    @User() user: any,
    @Body() body: updateRekomendasiDto,
  ) {
    return await this.rekomendasiService.updatePerekomendasi(user.id, body);
  }
}
