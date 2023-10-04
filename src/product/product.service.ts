import {
  Injectable,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

      const query = this.productRepo.createQueryBuilder('produk');

      query.leftJoinAndSelect('produk.category', 'category');

      const filter: any = [];
      if (Object.keys(param).length > 0) {
        for (const items in param) {
          if (
            [
              'limit',
              'page',
              'skip',
              'includeDeleted',
              'status',
              'stock_status',
              'harga_min',
              'harga_max',
              'order_by',
              'orientation',
            ].includes(items) == false &&
            param[items] != ''
          ) {
            const filterVal =
              items == 'category_id'
                ? ['IN', `(${param[items]})`]
                : ['LIKE', `'%${param[items]}%'`];
            const flags = 'produk';
            filter.push(`${flags}.${items} ${filterVal[0]} ${filterVal[1]}`);
          }
        }

        if (param?.status && param?.status == 'publish') {
          filter.push(`produk.status = '1'`);
        } else if (param?.status && param?.status == 'draft') {
          filter.push(`produk.status = '0'`);
        }

        const minHarga = param?.harga_min || 0;
        const maxHarga = param?.harga_max || false;
        if (maxHarga) {
          filter.push(
            `(produk.harga_jual BETWEEN ${minHarga} AND ${maxHarga})`,
          );
        } else if (minHarga) {
          filter.push(`produk.harga_jual >= ${minHarga}`);
        }

        if (param?.stock_status && param?.stock_status == 'habis') {
          filter.push(`produk.stok <= produk.min_stok`);
        } else if (param?.stock_status && param?.stock_status == 'tersedia') {
          filter.push(`produk.stok > produk.min_stok`);
        }

        if (filter.length > 0) {
          const queryFilter = filter.join(' AND ');
          query.where(queryFilter);
        }
      }

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
}
