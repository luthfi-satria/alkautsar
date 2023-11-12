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
import { WishlistService } from './wishlist.service';
import { CreateWishDto, UpdateWishDto, WishListDto } from './dto/wishlist.dto';
import { userInfo } from 'os';

@Controller('api/wish')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class WishlistController {
  constructor(private readonly wishService: WishlistService) {}

  @Get('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ListWish(@User() user: any, @Query() query: WishListDto) {
    return await this.wishService.ListWish(user, query);
  }

  @Get('total')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async TotalWish(@User() user: any) {
    return await this.wishService.TotalWish(user);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailWish(@User() user: any, @Param('id') product_id: number) {
    return await this.wishService.DetailWish(user, product_id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateWish(@User() user: any, @Body() body: CreateWishDto) {
    return await this.wishService.CreateWish(user, body);
  }

  @Put('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateWish(@User() user: any, @Body() body: UpdateWishDto) {
    return await this.wishService.UpdateWish(user, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteWish(@Param('id') WishId: number) {
    return await this.wishService.DeleteWish(WishId);
  }

  @Post('delete_bulk')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteBulkWish(@Body() body: any) {
    return await this.wishService.DeleteBulkWish(body.ids);
  }

  @Post('movetowish/:product_id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async MoveCartToWish(
    @User() userInfo,
    @Param('product_id') product_id: string,
  ) {
    return await this.wishService.AddToWish(userInfo, product_id);
  }

  @Post('movetocart/:product_id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async MoveWishToCart(
    @User() userInfo,
    @Param('product_id') product_id: string,
  ) {
    return await this.wishService.AddToCart(userInfo, product_id);
  }
}
