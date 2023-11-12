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
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { CartListDto, CreateCartDto, UpdateCartDto } from './dto/cart.dto';
import { CartService } from './cart.service';

@Controller('api/cart')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ListCart(@User() user: any, @Query() query: CartListDto) {
    return await this.cartService.ListCart(user, query);
  }

  @Get('total')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async TotalCart(@User() user: any) {
    return await this.cartService.TotalCart(user);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailCart(@User() user: any, @Param('id') product_id: number) {
    return await this.cartService.DetailCart(user, product_id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateCart(@User() user: any, @Body() body: CreateCartDto) {
    return await this.cartService.CreateCart(user, body);
  }

  @Put('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateCart(@User() user: any, @Body() body: UpdateCartDto) {
    return await this.cartService.UpdateCart(user, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteCart(@Param('id') cartId: number) {
    return await this.cartService.DeleteCart(cartId);
  }

  @Post('delete_bulk')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteBulkCart(@Body() body: any) {
    return await this.cartService.DeleteBulkCart(body.ids);
  }
}
