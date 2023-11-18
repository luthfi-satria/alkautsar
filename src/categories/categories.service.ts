import {
  Injectable,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Like, MoreThan, Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RSuccessMessage } from '../response/response.interface';
import { UsersService } from '../users/users.service';
import { DatetimeHelper } from '../helper/datetime.helper';
import { CategoryDocuments } from '../database/entities/categories.entities';
import {
  CreateCategoryDto,
  ListCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryDocuments)
    private readonly categoryRepo: Repository<CategoryDocuments>,
    private readonly responseService: ResponseService,
  ) {}

  async ListCategory(param: ListCategoryDto, raw = false) {
    try {
      const limit = param?.limit || 10;
      const page = param?.page || 1;
      const skip = (page - 1) * limit;
      let where = {};

      if (param?.name) {
        where = { ...where, name: Like(`%${param?.name}%`) };
      }

      const query = this.categoryRepo.createQueryBuilder('cat').where(where);

      let findQuery = {};
      let count = 0;

      if (param?.includeDeleted && param?.includeDeleted == 'true') {
        query.withDeleted();
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
        message: 'Get List Category success',
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
      Logger.error(err.message, 'Kategori gagal ditampilkan');
      throw err;
    }
  }

  async DetailCategory(id) {
    try {
      const getProfile = await this.categoryRepo
        .createQueryBuilder('cat')
        .where(`cat.id = :id`, { id: id })
        .getOne();

      if (getProfile) {
        return this.responseService.success(true, 'Category', getProfile);
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        value: id,
        property: 'id Category',
        constraint: ['Category tidak ditemukan'],
      });
    } catch (error) {
      Logger.log(error.message, 'Mengambil data profil gagal');
      throw error;
    }
  }

  async CreateCategory(data: CreateCategoryDto) {
    try {
      const profile = await this.categoryRepo.findOneBy({ name: data.name });

      if (profile) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(data.name),
            property: 'name',
            constraint: ['Kategori sudah tersedia!'],
          },
          'Kategori sudah tersedia',
        );
      }

      const result = await this.categoryRepo
        .save(data)
        .catch((e) => {
          Logger.error(e.message, '', 'Create Category');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menambah Category baru!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE CATEGORY =>', error);
      throw error;
    }
  }

  async UpdateCategory(id, data: UpdateCategoryDto) {
    try {
      const profile = await this.categoryRepo.findOneBy({
        id: id,
      });

      if (!profile) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(id),
            property: 'id',
            constraint: ['kategori tidak ditemukan!'],
          },
          'Kategori tidak ditemukan',
        );
      }

      const invest: Partial<CategoryDocuments> = {
        ...profile,
        ...data,
      };

      const result = await this.categoryRepo
        .save(invest)
        .catch((e) => {
          Logger.error(e.message, '', 'Update Category');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses update Category data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] UPDATE Category =>', error);
      throw error;
    }
  }

  async DeleteCategory(id: string) {
    try {
      const result = await this.categoryRepo
        .createQueryBuilder()
        .softDelete()
        .where('id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] DELETE CATEGORY');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menghapus data kategori!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] DELETE Category =>', error);
      throw error;
    }
  }

  async RestoreCategory(id: string) {
    try {
      const result = await this.categoryRepo
        .createQueryBuilder()
        .restore()
        .where('id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] RESTORE CATEGORY');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses mengembalikan data kategori!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] RESTORE Category =>', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(param: ListCategoryDto) {
    try {
      const users = await this.ListCategory(param, false);
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
            constraint: ['Gagal mengunduh data kategori', error.message],
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

    const rows = [['No', 'Nama', 'Keterangan', 'Urutan', 'Status']];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items.name ? items.name : '',
          items.description ? items.description : '',
          items.sequence ? items.sequence : '',
          items.deleted_at ? 'Tidak aktif' : 'Aktif',
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
