import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { InvestorService } from './investor.service';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import {
  CreateInvestorDto,
  InvestorIdDto,
  ListInvestorDto,
  UpdateInvestorDto,
} from './dto/investor.dto';

@Controller('api/investor')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Get('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ListInvestor(@Query() query: ListInvestorDto) {
    return await this.investorService.ListInvestor(query);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailInvestor(@Param() param: InvestorIdDto) {
    return await this.investorService.DetailInvestor(param.id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateInvestor(@Body() body: CreateInvestorDto) {
    return await this.investorService.CreateInvestor(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateInvestor(
    @Param() param: InvestorIdDto,
    @Body() body: UpdateInvestorDto,
  ) {
    return await this.investorService.UpdateInvestor(param.id, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteInvestor(@Param() param: InvestorIdDto) {
    return await this.investorService.DeleteInvestor(param.id);
  }
}
