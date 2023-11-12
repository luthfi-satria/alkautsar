import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RSuccessMessage } from '../response/response.interface';
import { WishlistDocument } from './entities/wishlist.entities';
import { CreateWishDto, UpdateWishDto, WishListDto } from './dto/wishlist.dto';
import { CartDocuments } from '../cart/entities/cart.entities';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistDocument)
    private readonly wishRepo: Repository<WishlistDocument>,
    @InjectRepository(CartDocuments)
    private readonly cartRepo: Repository<CartDocuments>,
    private readonly responseService: ResponseService,
  ) {}

  async ListWish(user: any, param: Partial<WishListDto>, raw = false) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      const query = this.wishRepo
        .createQueryBuilder('wish')
        .leftJoin('wish.user', 'user')
        .leftJoinAndSelect('wish.product', 'produk')
        .where(`wish.user_id = :user_id`, { user_id: user.id });

      if (param?.wish_ids) {
        query.andWhere(`wish.id IN (:...wish_ids)`, {
          wish_ids: param.wish_ids,
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
        message: 'Get List wish success',
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
      Logger.error(err.message, 'wish gagal ditampilkan');
      throw err;
    }
  }

  async TotalWish(user: any) {
    try {
      const total = await this.wishRepo
        .createQueryBuilder()
        .select('SUM(qty) AS total')
        .where({ user_id: user.id })
        .getRawOne();

      if (total?.total) {
        total.total = Number(total.total);
      }
      return this.responseService.success(true, 'total wish', total);
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  async DetailWish(user: any, id: number) {
    try {
      const findwish = await this.wishRepo.findOneBy({
        user_id: user.id,
        product_id: id,
      });

      return this.responseService.success(true, 'Detail wish', findwish || {});
    } catch (error) {
      Logger.log('[ERROR] DETAIL wish =>', error);
      throw error;
    }
  }

  async CreateWish(user: any, data: CreateWishDto) {
    try {
      const findwish = await this.wishRepo.findOneBy({
        user_id: user.id,
        product_id: data.product_id,
      });

      const wish: Partial<WishlistDocument> = {
        ...findwish,
        user_id: user.id,
        product_id: data.product_id,
        qty: 1,
        catatan: data.catatan,
      };
      const result = await this.wishRepo
        .save(wish)
        .catch((e) => {
          Logger.error(e.message, '', 'Create wish');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menambah wishlist!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE WISH =>', error);
      throw error;
    }
  }

  async UpdateWish(user: any, data: UpdateWishDto) {
    try {
      const findwish = await this.wishRepo.findOneBy({
        user_id: user.id,
        product_id: data.product_id,
      });

      const update = { ...findwish, ...data };
      const result = await this.wishRepo
        .save(update)
        .catch((e) => {
          Logger.error(e.message, '', 'Update wish');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses update wish data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] UPDATE wish => ', error);
      throw error;
    }
  }

  async DeleteWish(id: number) {
    try {
      const findwishData = await this.wishRepo.findOneBy({
        id: id,
      });

      if (findwishData) {
        const result = await this.wishRepo.delete({ id: id });
        return this.responseService.success(
          true,
          'Sukses menghapus wishlist!',
          result,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] DELETE wish => ', error);
      throw error;
    }
  }

  async DeleteBulkWish(ids: number[]) {
    try {
      Logger.log('[INFO] TRYING TO REMOVE WISH => ', ids);
      const deleteBulk = await this.wishRepo
        .createQueryBuilder()
        .delete()
        .where(`id IN (:...ids)`, { ids: ids })
        .execute();

      return this.responseService.success(
        true,
        'wish berhasil dihapus',
        deleteBulk,
      );
    } catch (error) {
      Logger.log('[ERROR] DELETE BULK WISH', error);
      throw error;
    }
  }

  async AddToWish(user: any, product_id: string) {
    try {
      Logger.log('[INFO] TRYING TO MOVE CART TO WISH => ', product_id);
      const cart = await this.cartRepo.findOneBy({
        user_id: user.id,
        product_id: Number(product_id),
      });
      if (cart) {
        const wishes = await this.wishRepo.findOneBy({
          user_id: user.id,
          product_id: Number(product_id),
        });
        const wishData = {
          ...wishes,
          qty: cart?.qty,
          user_id: user?.id,
          product_id: Number(product_id),
        };
        const newWish = await this.wishRepo
          .save(wishData)
          .then(async (data) => {
            await this.cartRepo.delete({
              user_id: user.id,
              product_id: wishData.product_id,
            });
            return data;
          })
          .catch((err) => {
            throw err;
          });
        return this.responseService.success(
          true,
          'wish berhasil ditambahkan',
          newWish,
        );
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        constraint: ['product_id'],
        value: product_id,
        property: 'product id tidak ditemukan',
      });
    } catch (error) {
      Logger.log('[ERROR] MOVE CART TO WISH', error);
      throw error;
    }
  }

  async AddToCart(user: any, product_id: string) {
    try {
      Logger.log('[INFO] TRYING TO MOVE WISH TO CART => ', product_id);
      const cart = await this.wishRepo.findOneBy({
        user_id: user.id,
        product_id: Number(product_id),
      });
      if (cart) {
        const wishData: Partial<CartDocuments> = {
          user_id: cart?.user_id,
          product_id: cart?.product_id,
          qty: 1,
        };
        const newWish = await this.cartRepo
          .save(wishData)
          .then(async (data) => {
            await this.wishRepo.delete({
              user_id: user.id,
              product_id: wishData.product_id,
            });
            return data;
          })
          .catch((err) => {
            throw err;
          });
        return this.responseService.success(
          true,
          'Cart berhasil ditambahkan',
          newWish,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] MOVE WISH TO CART', error);
      throw error;
    }
  }
}
