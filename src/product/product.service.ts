import {
  Injectable,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RSuccessMessage } from '../response/response.interface';
import {
  CreateProductDto,
  ListProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductDocuments } from '../database/entities/product.entities';
import * as fs from 'fs';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductDocuments)
    private readonly productRepo: Repository<ProductDocuments>,
    private readonly responseService: ResponseService,
  ) {}

  async ListProduct(param: ListProductDto, raw = false) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      let where = {};

      if (param?.category_id) {
        where = { ...where, category_id: In(param?.category_id) };
      }

      if (param?.name) {
        where = { ...where, name: Like(`%${param?.name}%`) };
      }

      if (param?.kode_produk) {
        where = { ...where, kode_produk: Like(`%${param?.kode_produk}%`) };
      }

      if (param?.status) {
        const status = param?.status == 'publish' ? 1 : 0;
        where = { ...where, status: status };
      }

      if (param?.stock_status && param?.stock_status == 'tersedia') {
        where = { ...where, stok: MoreThan('produk.min_stok') };
      }
      if (param?.stock_status && param?.stock_status == 'habis') {
        where = { ...where, stok: LessThanOrEqual('produk.min_stok') };
      }

      const minHarga = param?.harga_min || 0;
      const maxHarga = param?.harga_max || false;
      if (maxHarga) {
        where = { ...where, harga_jual: Between(minHarga, maxHarga) };
      } else if (minHarga) {
        where = { ...where, harga_jual: MoreThanOrEqual(minHarga) };
      }

      const query = this.productRepo.createQueryBuilder('produk');

      query.leftJoinAndSelect('produk.category', 'category').where(where);

      let findQuery = {};
      let count = 0;

      if (param?.includeDeleted && param?.includeDeleted == 'true') {
        query.withDeleted();
      }

      const orientation =
        param?.orientation && param?.orientation.toLowerCase() == 'asc'
          ? 'ASC'
          : 'DESC';
      if (param?.order_by && param.order_by != '') {
        query.orderBy('produk.' + param.order_by, orientation);
      }

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
        message: 'Get List Product success',
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
      Logger.error(err.message, 'produk gagal ditampilkan');
      throw err;
    }
  }

  async DetailProduct(id) {
    try {
      const getProfile = await this.productRepo
        .createQueryBuilder('produk')
        .leftJoinAndSelect('produk.category', 'category')
        .where(`produk.id = :id`, { id: id })
        .getOne();

      if (getProfile) {
        return this.responseService.success(true, 'Product', getProfile);
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        value: id,
        property: 'id Product',
        constraint: ['Product tidak ditemukan'],
      });
    } catch (error) {
      Logger.log(error.message, 'Mengambil data produk gagal');
      throw error;
    }
  }

  async CreateProduct(data: CreateProductDto) {
    try {
      const profile = await this.productRepo.findOneBy({
        kode_produk: data.kode_produk,
      });

      if (profile) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(data.name),
            property: 'name',
            constraint: ['produk sudah tersedia!'],
          },
          'produk sudah tersedia',
        );
      }

      const result = await this.productRepo
        .save(data)
        .catch((e) => {
          Logger.error(e.message, '', 'Create Product');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menambah Product baru!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE Product =>', error);
      throw error;
    }
  }

  async UpdateProduct(id, data: UpdateProductDto) {
    try {
      const profile = await this.productRepo.findOneBy({
        id: id,
      });

      const findByKode = await this.productRepo.countBy({
        kode_produk: data.kode_produk,
      });

      if (!profile || findByKode > 1) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: findByKode > 1 ? data.kode_produk : String(id),
            property: findByKode > 1 ? 'kode_produk' : 'id',
            constraint: [
              findByKode > 1
                ? 'duplikat kode produk'
                : 'produk tidak ditemukan!',
            ],
          },
          findByKode > 1 ? 'duplikat kode produk' : 'produk tidak ditemukan!',
        );
      }

      const invest: Partial<ProductDocuments> = {
        ...profile,
        ...data,
      };

      const result = await this.productRepo
        .save(invest)
        .catch((e) => {
          Logger.error(e.message, '', 'Update Product');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses update Product data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] UPDATE Product =>', error);
      throw error;
    }
  }

  async DeleteProduct(id: string) {
    try {
      const result = await this.productRepo
        .createQueryBuilder()
        .softDelete()
        .where('id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] DELETE Product');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menghapus data produk!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] DELETE Product =>', error);
      throw error;
    }
  }

  async RestoreProduct(id: string) {
    try {
      const result = await this.productRepo
        .createQueryBuilder()
        .restore()
        .where('id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] RESTORE Product');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses mengembalikan data produk!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] RESTORE Product =>', error);
      throw error;
    }
  }

  async DeductStock(productArray: any) {
    try {
      Logger.log('[INFO] TRYING TO DEDUCT STOCK, data =>', productArray);
      if (productArray && productArray.length > 0) {
        const productIds = productArray.map((items) => items?.id);
        const product = await this.productRepo
          .createQueryBuilder()
          .where(`id IN (:...ids)`, { ids: productIds })
          .getMany();
        if (product) {
          const updateData: any = [];
          for (const item of product) {
            const productIdx = productArray.filter(
              (list) => list.id == item.id,
            );

            updateData.push({
              id: item.id,
              stok: item.stok - productIdx[0].qty,
            });
          }

          if (updateData.length > 0) {
            await this.productRepo.save(updateData);
          }

          return this.responseService.success(
            true,
            'Stok produk telah diperbaharui',
          );
        }

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: productIds,
            property: 'Id produk',
            constraint: ['Id produk tidak ditemukan!'],
          },
          'Id produk tidak ditemukan',
        );
      }
      return {
        code: HttpStatus.BAD_REQUEST,
        message: 'Invalid request data',
        param: productArray,
      };
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  async ReturningStock(orderProduct: any) {
    try {
      const listProducts: Record<string, any> = {
        listID: [],
        ObjectProduct: {},
      };
      for (const items of orderProduct) {
        listProducts.listID.push(items.product_id);
        listProducts.ObjectProduct[items.product_id] = items.qty;
      }

      if (listProducts.listID.length > 0) {
        const getListProduct = await this.productRepo
          .createQueryBuilder()
          .where(`id IN (:...product_list)`, {
            product_list: listProducts.listID,
          })
          .getMany();

        if (getListProduct) {
          const updateData: Partial<ProductDocuments>[] = [];
          for (const items of getListProduct) {
            updateData.push({
              id: items.id,
              stok: items.stok + listProducts.ObjectProduct[items.id],
            });
          }

          if (updateData.length > 0) {
            await this.productRepo.save(updateData).catch((error) => {
              throw error;
            });
          }
          return updateData;
        }
      }
      return [];
    } catch (error) {
      Logger.log('[ERROR] RETURNING STOCK', error);
      throw error;
    }
  }

  /**
   * UPLOAD FOTO
   */

  async uploadImage(id: string, file: any) {
    try {
      if (id && id != ':id') {
        const path = file.path;
        const newDestination = `./uploads/products/${id}`;
        const newImagePath = `${newDestination}/${file.filename}`;
        const product = await this.productRepo.findOneBy({
          id: Number(id),
        });
        if (product) {
          // HANDLE IMAGE => MOVING IMAGE FROM TEMP FOLDER TO SPESIFIC DIRECTORY
          fs.readFile(path, function (err, data) {
            if (!fs.existsSync(newDestination)) {
              fs.mkdirSync(newDestination, { recursive: true });
            }

            // REMOVE PREVIOUS IMAGE BEFORE CHANGE WITH NEW ONE
            if (product.image && product.image != '') {
              fs.unlink(`${newDestination}/${product.image}`, function () {
                if (err) throw err;
              });
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

          // HANDLE DATA => UPDATE USER PROFILE PHOTO
          await this.productRepo.save({
            ...product,
            image: file.filename,
          });
          return this.responseService.success(
            true,
            'Foto produk telah diperbaharui!',
            {
              image: file.filename,
            },
          );
        } else {
          fs.unlink(path, function (err) {
            if (err) throw err;
          });
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: id,
              property: 'Image produk',
              constraint: ['Image produk tidak ditemukan!'],
            },
            'Image produk tidak ditemukan',
          );
        }
      }
    } catch (err) {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.log('CATCH ERROR', error);
        }
      });
      Logger.log(err.message, 'pembaharuan produk tidak berhasil');
      throw err;
    }
  }

  async readPhoto(id: string) {
    try {
      const product = await this.productRepo.findOneBy({
        id: Number(id),
      });
      if (product) {
        return product;
      }
      return {};
    } catch (error) {
      Logger.error('Terjadi galat pada sistem', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(param: ListProductDto) {
    try {
      const users = await this.ListProduct(param, false);
      const excelObjects = await this.createExcelObjects(users);
      return excelObjects;
    } catch (error) {
      Logger.log('[ERROR] EXPORT EXCEL => ', error);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: '',
            constraint: ['Gagal mengunduh data produk', error.message],
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
        'Kode Produk',
        'Kategori',
        'Nama',
        'Keterangan',
        'Beli',
        'Jual',
        'Status',
        'Stok',
        'Minimal Stok',
      ],
    ];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items.kode_produk ? items.kode_produk : '',
          items.category?.name ? items.category?.name : '',
          items.name ? items.name : '',
          items.description ? items.description : '',
          items.harga_beli ? items.harga_beli : '',
          items.harga_jual ? items.harga_jual : '',
          items.status == 1 ? 'Publish' : 'Draft',
          items.stok ? items.stok : '',
          items.min_stok ? items.min_stok : '',
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

  /**
   * STATISTIC
   */

  async Statistics() {
    try {
      const total = await this.productRepo.createQueryBuilder().getCount();

      const stokHabis = await this.StokHabis();
      return {
        total: total,
        stokHabis: stokHabis,
      };
    } catch (error) {
      return error;
    }
  }

  async StokHabis() {
    return await this.productRepo
      .createQueryBuilder()
      .select(['kode_produk', 'name'])
      .where('stok = min_stok')
      .getRawMany();
  }
}
