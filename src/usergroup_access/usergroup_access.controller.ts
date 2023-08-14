import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
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

@Controller('api/access')
export class UsergroupAccessController {
  constructor(private readonly accessService: UsergroupAccessService) {}

  @Get()
  @ResponseStatusCode()
  @UserType('admin')
  @AuthJwtGuard()
  async getAllAccess(@Body() body: ListAccessmenu) {
    return await this.accessService.getAll(body);
  }

  @Get('/user')
  @ResponseStatusCode()
  @UserType('admin')
  @AuthJwtGuard()
  async getAccess(@User() user) {
    return await this.accessService.getAccess(user);
  }

  @Post()
  @ResponseStatusCode()
  @UserType('admin')
  @AuthJwtGuard()
  async create(@Body() body: UsergroupAccessDto) {
    return await this.accessService.create(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType('admin')
  @AuthJwtGuard()
  async update(
    @Param() param: GetUsergroupAccessID,
    @Body() body: UsergroupAccessDto,
  ) {
    return await this.accessService.update(param.id, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType('admin')
  @AuthJwtGuard()
  async delete(@Param() param: GetUsergroupAccessID) {
    return await this.accessService.delete(param.id);
  }
}
