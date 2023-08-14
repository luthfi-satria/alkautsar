import {
  Controller,
  Body,
  Param,
  Post,
  Get,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { GetUsergroupID, UsergroupDto } from './dto/usergroup.dto';
import { UsergroupService } from './usergroup.service';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';

@Controller('api/usergroup')
@UseInterceptors(AppconfigInterceptor)
export class UsergroupController {
  constructor(private readonly usergroupService: UsergroupService) {}

  @Post()
  @UserType('admin')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async create(@Body() body: UsergroupDto) {
    const result = this.usergroupService.create(body);
    return result;
  }

  @Get()
  @UserType('admin')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async findAll() {
    return await this.usergroupService.getAll();
  }

  @Get(':id')
  @UserType('admin')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async findOne(@Param() param: GetUsergroupID) {
    return await this.usergroupService.findOne(param.id);
  }

  @Put(':id')
  @UserType('admin')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async update(@Param() param: GetUsergroupID, @Body() Body: UsergroupDto) {
    return await this.usergroupService.update(param.id, Body);
  }

  @Delete(':id')
  @UserType('admin')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async delete(@Param() param: GetUsergroupID) {
    return await this.usergroupService.delete(param.id);
  }

  @Get('seed/read')
  @ResponseStatusCode()
  async readFile() {
    const result = await this.usergroupService.seeding();
    return result;
  }
}
