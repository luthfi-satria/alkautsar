import {
  Controller,
  Get,
  Logger,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { UsersService } from '../users/users.service';
import { HistoryKreditService } from '../history_kredit/history_kredit.service';
import { ProductService } from '../product/product.service';
import { InvestorService } from '../investor/investor.service';
import { KreditService } from '../kredit/kredit.service';
import { OrderService } from '../order/order.service';
import { UserType } from '../hash/guard/user-type.decorator';
import { ResponseService } from '../response/response.service';

@Controller('api/dashboard')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class DashboardController {
  constructor(
    private readonly userService: UsersService,
    private readonly productService: ProductService,
    private readonly investorService: InvestorService,
    private readonly kreditService: KreditService,
    private readonly orderService: OrderService,
    private readonly historyService: HistoryKreditService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('statistics')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi')
  @AuthJwtGuard()
  async Statistics() {
    try {
      const result = {
        user: await this.userService.Statistics(),
        product: await this.productService.Statistics(),
        investor: await this.investorService.Statistics(),
        kredit: await this.kreditService.Statistics(),
        order: await this.orderService.Statistics(),
        tagihan: await this.historyService.Statistics(),
      };
      return this.responseService.success(true, 'sukses', result);
    } catch (error) {
      Logger.log('[ERROR] DASHBOARD', error);
      throw error;
    }
  }
}
