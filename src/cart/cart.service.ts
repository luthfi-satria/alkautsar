import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartDocuments } from './entities/cart.entities';
import { Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { CartListDto, CreateCartDto, UpdateCartDto } from './dto/cart.dto';
import { RSuccessMessage } from '../response/response.interface';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartDocuments)
    private readonly cartRepo: Repository<CartDocuments>,
    private readonly responseService: ResponseService,
  ) {}

  async ListCart(user: any, param: Partial<CartListDto>, raw = false) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      const query = this.cartRepo
        .createQueryBuilder('cart')
        .leftJoin('cart.user', 'user')
        .leftJoinAndSelect('cart.product', 'produk')
        .where(`cart.user_id = :user_id`, { user_id: user.id });

      if (param?.cart_ids) {
        query.andWhere(`cart.id IN (:...cart_ids)`, {
          cart_ids: param.cart_ids,
        });
      }

      let findQuery = {};
      let count = 0;

      if (raw == false) {
        [findQuery, count] = await query
          .skip(skip)
          .take(limit)
          .getManyAndCount();
      } else {
        count = await query.getCount();
        findQuery = await query.offset(skip).limit(limit).getRawMany();
      }

      const results: RSuccessMessage = {
        success: true,
        message: 'Get List Cart success',
        data: {
          total: count,
          page: page,
          skip: skip,
          limit: limit,
          items: findQuery,
        },
      };

      return results;
    } catch (err) {
      Logger.error(err.message, 'cart gagal ditampilkan');
      throw err;
    }
  }

  async TotalCart(user: any) {
    try {
      const total = await this.cartRepo
        .createQueryBuilder()
        .select('SUM(qty) AS total')
        .where({ user_id: user.id })
        .getRawOne();

      if (total?.total) {
        total.total = Number(total.total);
      }
      return this.responseService.success(true, 'total cart', total);
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  async DetailCart(user: any, id: number) {
    try {
      const findCart = await this.cartRepo.findOneBy({
        user_id: user.id,
        product_id: id,
      });

      return this.responseService.success(true, 'Detail cart', findCart || {});
    } catch (error) {
      Logger.log('[ERROR] DETAIL CART =>', error);
      throw error;
    }
  }

  async CreateCart(user: any, data: CreateCartDto) {
    try {
      const findCart = await this.cartRepo.findOneBy({
        user_id: user.id,
        product_id: data.product_id,
      });
      const cart: Partial<CartDocuments> = {
        ...findCart,
        user_id: user.id,
        product_id: data.product_id,
        qty: findCart?.qty
          ? Number(findCart.qty) + Number(data.qty)
          : Number(data.qty),
        catatan: data.catatan,
      };
      const result = await this.cartRepo
        .save(cart)
        .catch((e) => {
          Logger.error(e.message, '', 'Create Cart');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menambah keranjang!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE CART =>', error);
      throw error;
    }
  }

  async UpdateCart(user: any, data: UpdateCartDto) {
    try {
      const findCart = await this.cartRepo.findOneBy({
        user_id: user.id,
        product_id: data.product_id,
      });

      const update = { ...findCart, ...data };
      const result = await this.cartRepo
        .save(update)
        .catch((e) => {
          Logger.error(e.message, '', 'Update cart');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses update cart data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] UPDATE CART => ', error);
      throw error;
    }
  }

  async DeleteCart(id: number) {
    try {
      const findCartData = await this.cartRepo.findOneBy({
        id: id,
      });

      if (findCartData) {
        const result = await this.cartRepo.delete({ id: id });
        return this.responseService.success(
          true,
          'Sukses menghapus keranjang!',
          result,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] DELETE CART => ', error);
      throw error;
    }
  }

  async DeleteBulkCart(ids: number[]) {
    try {
      Logger.log('[INFO] TRYING TO REMOVE CART => ', ids);
      const deleteBulk = await this.cartRepo
        .createQueryBuilder()
        .delete()
        .where(`id IN (:...ids)`, { ids: ids })
        .execute();

      return this.responseService.success(
        true,
        'cart berhasil dihapus',
        deleteBulk,
      );
    } catch (error) {
      Logger.log('[ERROR] DELETE BULK CART', error);
      throw error;
    }
  }
}
