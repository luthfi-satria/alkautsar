import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UsergroupAccessService } from './usergroup_access.service';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { User } from '../auth/auth.decorator';
import {
  GetUsergroupAccessID,
  ListAccessmenu,
  UsergroupAccessDto,
} from './dto/usergroup_access.dto';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';

@Controller('api/access')
@UseInterceptors(AppconfigInterceptor)
export class UsergroupAccessController {
  constructor(private readonly accessService: UsergroupAccessService) {}

  @Get()
  @ResponseStatusCode()
  @UserType('owner', 'staff')
  @AuthJwtGuard()
  async getAllAccess(@Body() body: ListAccessmenu) {
    return await this.accessService.getAll(body);
  }

  @Get('/user')
  @ResponseStatusCode()
  @UserType('owner', 'staff')
  @AuthJwtGuard()
  async getAccess(@User() user) {
    return await this.accessService.getAccess(user);
  }

  @Post()
  @ResponseStatusCode()
  @UserType('owner', 'staff')
  @AuthJwtGuard()
  async create(@Body() body: UsergroupAccessDto) {
    return await this.accessService.create(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType('owner', 'staff')
  @AuthJwtGuard()
  async update(
    @Param() param: GetUsergroupAccessID,
    @Body() body: UsergroupAccessDto,
  ) {
    return await this.accessService.update(param.id, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType('owner', 'staff')
  @AuthJwtGuard()
  async delete(@Param() param: GetUsergroupAccessID) {
    return await this.accessService.delete(param.id);
  }
}
