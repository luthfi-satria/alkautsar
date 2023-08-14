import {
  Controller,
  Body,
  Param,
  Post,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { AppmenuService } from './appmenu.service';
import {
  AppmenuDto,
  GetAppmenuID,
  ListAppmenu,
  UpdateAppmenuDto,
} from './dto/appmenu.dto';

@Controller('api/appmenu')
export class AppmenuController {
  constructor(private readonly appmenuService: AppmenuService) {}

  @Post()
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async create(@Body() body: AppmenuDto) {
    const result = this.appmenuService.create(body);
    return result;
  }

  @Get()
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async findAll(@Param() param: ListAppmenu) {
    return await this.appmenuService.getAll(param);
  }

  @Get(':id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async findOne(@Param() param: GetAppmenuID) {
    return await this.appmenuService.getDetailMenu(param.id);
  }

  @Put(':id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async update(@Param() param: GetAppmenuID, @Body() Body: UpdateAppmenuDto) {
    return await this.appmenuService.update(param.id, Body);
  }

  @Delete(':id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async delete(@Param() param: GetAppmenuID) {
    return await this.appmenuService.delete(param.id);
  }

  @Get('seed/read')
  @ResponseStatusCode()
  async readFile() {
    const result = await this.appmenuService.seeding();
    return result;
  }
}
