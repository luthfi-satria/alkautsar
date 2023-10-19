import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RMessage, RSuccessMessage } from '../response/response.interface';
import { CartService } from '../cart/cart.service';
import { OrderDocuments } from './entities/order.entities';
import { OrderDetailDocuments } from './entities/order.details.entities';
import { CreateOrder, OrderListDto, UpdateOrder } from './dto/order.dto';
import { PaymentMethod, StatusOrder } from './interface/order.interface';
import { randomUUID } from 'crypto';
import { ProductService } from '../product/product.service';
import * as fs from 'fs';
import { DatetimeHelper } from '../helper/datetime.helper';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderDocuments)
    private readonly orderRepo: Repository<OrderDocuments>,
    @InjectRepository(OrderDetailDocuments)
    private readonly orderDetailRepo: Repository<OrderDetailDocuments>,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly responseService: ResponseService,
  ) {}

  async ListOrder(user: any, param: OrderListDto, raw = false): Promise<any> {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      let where = {};
      const user_id =
        user?.level == 'owner' && param?.platform == 'admin' ? null : user?.id;

      if (user_id) {
        where = { ...where, user_id: user_id };
      }

      if (param?.kode_transaksi) {
        where = { ...where, kode_transaksi: param.kode_transaksi };
      }

      if (param?.status) {
        where = { ...where, status: StatusOrder[param.status.toLowerCase()] };
      }

      if (param?.payment_method) {
        where = {
          ...where,
          payment_method: PaymentMethod[param.payment_method],
        };
      }

      if (param?.date_start && param?.date_end) {
        where = {
          ...where,
          created_at: Between(
            param.date_start + ' 00:00:00',
            param.date_end + ' 23:59:59',
          ),
        };
      } else if (param?.date_start) {
        where = {
          ...where,
          created_at: MoreThanOrEqual(param.date_start + '00:00:00'),
        };
      } else if (param?.date_end) {
        where = {
          ...where,
          created_at: LessThanOrEqual(param.date_end + '23:59:59'),
        };
      }

      const query = this.orderRepo.createQueryBuilder('order');
      if (raw == false) {
        query
          .select([
            'order.id',
            'order.kode_transaksi',
            'order.payment_date',
            'order.payment_method',
            'order.status',
            'order.total_item',
            'order.grand_total',
            'order.created_at',
            'order.verified_at',
            'details',
            'product',
            'user',
          ])
          .leftJoin('order.user', 'user')
          .leftJoin('order.details', 'details')
          .leftJoin('details.product', 'product')
          .leftJoin('order.verificator', 'verificator');
      } else {
        query
          .leftJoinAndSelect('order.user', 'user')
          .leftJoinAndSelect('order.verificator', 'verificator');
      }

      if (where) {
        query.where(where);
      }

      const orientation =
        param?.orientation && param?.orientation.toLowerCase() == 'asc'
          ? 'ASC'
          : 'DESC';
      if (param?.order_by && param.order_by != '') {
        query.orderBy('order.' + param.order_by, orientation);
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
        message: 'Get list order success',
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
      Logger.error(err.message, 'Order gagal ditampilkan');
      throw err;
    }
  }

  async DetailOrder(user: any, kode_transaksi: string): Promise<any> {
    try {
      const detail = this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.details', 'details')
        .leftJoinAndSelect('details.product', 'product')
        .where(`order.kode_transaksi = :kode`, { kode: kode_transaksi });

      if (user.level != 'owner') {
        detail.andWhere(`order.user_id = :userId`, { userId: user.id });
      }
      const result = await detail.getOne();

      return this.responseService.success(true, 'Detail order', result || {});
    } catch (error) {
      Logger.log('[ERROR] DETAIL ORDER =>', error);
      throw error;
    }
  }

  async CreateOrder(user: any, param: CreateOrder): Promise<any> {
    try {
      const { data } = await this.cartService.ListCart(
        user,
        {
          cart_ids: param.cart_ids,
          limit: 50,
        },
        false,
      );
      if (data && data.hasOwnProperty('items')) {
        const orderData: Partial<OrderDocuments> = {
          kode_transaksi: randomUUID().split('-')[0],
          user_id: user.id,
          status: StatusOrder.waiting,
          total_item: 0,
          grand_total: 0,
        };

        const detail_order: Partial<OrderDetailDocuments>[] = [];
        let grand_total = 0;
        const productDeduction: any[] = [];
        for (const items of data['items']) {
          orderData.total_item += items?.qty;
          const hargaItem =
            parseInt(items?.qty) * parseFloat(items?.product?.harga_jual);
          grand_total += hargaItem;

          detail_order.push({
            kode_transaksi: orderData.kode_transaksi,
            product_id: items?.product?.id,
            qty: items?.qty,
            harga: items?.product?.harga_jual,
            total_harga: items?.qty * items?.product?.harga_jual,
          });

          productDeduction.push({
            id: items?.product?.id,
            qty: items?.qty,
          });
        }

        orderData.grand_total = grand_total;

        await this.orderRepo
          .save(orderData)
          .then(async () => {
            await this.orderDetailRepo.save(detail_order).catch((error) => {
              throw error;
            });
            // remove cart data
            const delete_bulk = await this.cartService.DeleteBulkCart(
              param.cart_ids,
            );
            Logger.log('[INFO] DELETING BULK RESULT =>', {
              request: param.cart_ids,
              result: delete_bulk,
            });

            // update product qty
            const updateStock = await this.productService.DeductStock(
              productDeduction,
            );
            Logger.log('[INFO] DEDUCT STOCK =>', {
              request: productDeduction,
              result: updateStock,
            });
          })
          .catch((error) => {
            Logger.log('[EROR] SAVING ORDER', error);
            return error;
          });

        return this.responseService.success(
          true,
          'Pesanan telah dibuat, silahkan selesaikan pembayaran',
          orderData,
        );
      }

      throw data;
    } catch (error) {
      Logger.log('[ERROR] CREATE ORDER => ', error);
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        error,
        'Terjadi kesalahan pada server dalam mengolah data',
      );
    }
  }

  async UpdateOrder(user: any, param: UpdateOrder, file: any): Promise<any> {
    try {
      const getOrder = await this.DetailOrder(user, param.kode_transaksi);
      if (getOrder) {
        const transData: Partial<OrderDocuments> = {
          id: getOrder?.data?.id,
          kode_transaksi: getOrder?.data?.kode_transaksi,
          payment_method: param?.payment_method
            ? param.payment_method
            : PaymentMethod.cash,
          bank_name: param?.bank_name,
          status: param?.status ? StatusOrder[param.status] : StatusOrder.paid,
          payment_date: new Date(),
          ref_no: param?.ref_no,
        };

        // CEK UPLOAD BUKTI TRANSAKSI
        if (file) {
          const fileName = await this.UploadBuktiTransaksi(file);
          if (fileName != '') {
            transData.bukti_transaksi = fileName;
          }
        }

        const update = await this.orderRepo.save(transData).catch((error) => {
          throw error;
        });
        return await this.responseService.success(
          true,
          'Order telah diubah',
          update,
        );
      }
      const message: RMessage = {
        constraint: ['kode_transaksi'],
        property: 'kode transaksi',
        value: param.kode_transaksi,
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        message,
        'Kode transaksi tidak ditemukan',
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE ORDER => ', error);
      throw error;
    }
  }

  async UploadBuktiTransaksi(file: any): Promise<string> {
    try {
      const path = file.path;
      const newDestination = `./uploads/bukti`;
      const newImagePath = `${newDestination}/${file.filename}`;

      // HANDLE IMAGE => MOVING IMAGE FROM TEMP FOLDER TO SPESIFIC DIRECTORY
      fs.readFile(path, function (err, data) {
        if (!fs.existsSync(newDestination)) {
          fs.mkdirSync(newDestination, { recursive: true });
        }

        fs.writeFile(newImagePath, data, function (err) {
          fs.unlink(path, function () {
            if (err) throw err;
          });
        });

        if (err) {
          throw err;
        }
      });

      fs.unlink(path, function (err) {
        if (err) throw err;
      });
      return file.filename;
    } catch (err) {
      Logger.log('[ERROR] BUKTI TRANSAKSI => ', err);
      return '';
    }
  }

  async AbortOrder(user: any, kode_transaksi: string) {
    try {
      const orderDetail = await this.DetailOrder(user, kode_transaksi);
      if (orderDetail) {
        // UBAH STATUS PESANAN DARI WAITING MENJADI CANCEL
        const orderData: Partial<OrderDocuments> = {
          id: orderDetail?.data?.id,
          kode_transaksi: orderDetail?.data?.kode_transaksi,
          status: StatusOrder.canceled,
          canceled_at: new Date(),
        };

        await this.orderRepo.save(orderData).then(async () => {
          // Kembalikan jumlah stok
          const ReturningStock = await this.productService.ReturningStock(
            orderDetail?.data?.details,
          );

          Logger.log(
            `[INFO] PENGEMBALIAN STOK`,
            orderData,
            ' DETAIL => ',
            ReturningStock,
          );
        });
        return this.responseService.success(
          true,
          'Transaksi dibatalkan',
          orderData,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] ABORT ORDER => ', error);
      throw error;
    }
  }

  async ChangeStatus(user: any, kode_transaksi: string, status: string) {
    try {
      const orderDetail = await this.DetailOrder(user, kode_transaksi);
      if (orderDetail) {
        // UBAH STATUS PESANAN
        const orderData: Partial<OrderDocuments> = {
          id: orderDetail?.data?.id,
          kode_transaksi: orderDetail?.data?.kode_transaksi,
        };

        if (status == 'verify') {
          orderData.status = StatusOrder.proceed;
          orderData.verified_at = new Date();
          orderData.verificator_id = user.id;
        }

        if (status == 'done') {
          orderData.status = StatusOrder.success;
        }

        if (status == 'canceled') {
          orderData.status = StatusOrder.canceled;
        }

        await this.orderRepo.save(orderData).then(async () => {
          if (status == 'canceled') {
            await this.AbortOrder(user, kode_transaksi);
          }
        });
        return this.responseService.success(
          true,
          'Transaksi telah diubah',
          orderData,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] VERIFIKASI ORDER => ', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(user, param: OrderListDto) {
    try {
      const users = await this.ListOrder(user, param, true);
      const excelObjects = await this.createExcelObjects(users);
      return excelObjects;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: '',
            constraint: ['Gagal mengunduh data user', error.message],
          },
          'Bad Request',
        ),
      );
    }
  }

  async createExcelObjects(excelObjects) {
    if (!excelObjects && !excelObjects.data) {
      throw new NotFoundException('No data to download');
    }

    const rows = [
      [
        'No',
        'Kode Transaksi',
        'Tanggal',
        'Total Barang',
        'Total Harga',
        'Status',
        'Metode Bayar',
        'Tanggal Bayar',
        'Nama Bank',
        'No. Ref',
        'Tanggal Pembatalan',
      ],
    ];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items.order_kode_transaksi
            ? items.order_kode_transaksi.toUpperCase()
            : '',
          items.order_created_at
            ? DatetimeHelper.UTCToLocaleDate(items.order_created_at)
            : '',
          items.order_total_item ? items.order_total_item : '',
          items.order_grand_total ? items.order_grand_total : '',
          items.order_status ? this.convertStatus(items.order_status) : '',
          items.order_payment_method
            ? this.convertPaymentMethod(items.order_payment_method)
            : '',
          items.order_payment_date
            ? DatetimeHelper.UTCToLocaleDate(items.order_payment_date)
            : '',
          items.order_bank_name ? items.order_bank_name : '',
          items.order_ref_no ? items.order_ref_no : '',
          items.order_canceled_at
            ? DatetimeHelper.UTCToLocaleDate(items.order_canceled_at)
            : '',
        ]);
        i++;
      }
    } else {
      rows.push(['Tidak ada data yang dapat ditampilkan']);
    }

    return {
      rows: rows,
    };
  }

  convertStatus(status: string): string {
    let result = '';
    switch (status) {
      case 'WAITING':
        result = 'BLM BAYAR';
        break;
      case 'PAID':
        result = 'SUDAH BAYAR';
        break;
      case 'PROCEED':
        result = 'DIPROSES';
        break;
      case 'SUCCESS':
        result = 'SELESAI';
        break;
      case 'CANCELED':
        result = 'DIBATALKAN';
        break;
    }
    return result;
  }

  convertPaymentMethod(status: string): string {
    let result = '';
    switch (status) {
      case 'CASH':
        result = 'TUNAI';
        break;
      case 'SALARY DEDUCTION':
        result = 'POTONG GAJI';
        break;
      default:
        result = 'TRANSFER';
        break;
    }
    return result;
  }
}
