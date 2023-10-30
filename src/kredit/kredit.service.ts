import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RMessage, RSuccessMessage } from '../response/response.interface';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { DatetimeHelper } from '../helper/datetime.helper';
import { KreditDocument } from './entities/kredit.entities';
import { KreditSupportDocument } from './entities/kredit_support.entities';
import { CreateKredit, KreditListDto } from './dto/kredit.dto';
import { StatusKredit } from './interface/kredit_status.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class KreditService {
  constructor(
    @InjectRepository(KreditDocument)
    private readonly kreditRepo: Repository<KreditDocument>,
    @InjectRepository(KreditSupportDocument)
    private readonly kreditSuppRepo: Repository<KreditSupportDocument>,
    private readonly userService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  async ListKredit(user: any, param: KreditListDto, raw = false): Promise<any> {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      let where = {};

      if (param?.profile_name) {
        where = { ...where, ['profile.name']: param.profile_name };
      }

      if (param?.kredit_code) {
        where = { ...where, kredit_code: param.kredit_code };
      }

      if (param?.status) {
        where = { ...where, status: param.status };
      }

      if (param?.jenis_pembiayaan) {
        where = { ...where, jenis_pembiayaan: param.jenis_pembiayaan };
      }

      if (param?.profile_phone) {
        where = {
          ...where,
          ['profile.phone']: param.profile_phone,
        };
      }

      const query = this.kreditRepo.createQueryBuilder('kredit');
      if (raw == false) {
        query
          .leftJoinAndSelect('kredit.profile', 'profile')
          .leftJoinAndSelect('kredit.verificator', 'verificator')
          .leftJoinAndSelect('kredit.approver', 'approver')
          .leftJoinAndSelect('kredit.document', 'document');
      } else {
        query
          .leftJoinAndSelect('kredit.profile', 'profile')
          .leftJoinAndSelect('kredit.verificator', 'verificator')
          .leftJoinAndSelect('kredit.approver', 'approver');
      }

      if (where) {
        query.where(where);
      }

      const orientation =
        param?.orientation && param?.orientation.toLowerCase() == 'asc'
          ? 'ASC'
          : 'DESC';
      if (param?.order_by && param.order_by != '') {
        query.orderBy('kredit.' + param.order_by, orientation);
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
        message: 'Get list kredit success',
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
      Logger.error(err.message, 'Kredit gagal ditampilkan');
      throw err;
    }
  }

  async DetailKredit(user: any, kredit_code: string): Promise<any> {
    try {
      const detail = this.kreditRepo
        .createQueryBuilder('kredit')
        .leftJoinAndSelect('kredit.profile', 'profile')
        .leftJoinAndSelect('kredit.verificator', 'verificator')
        .leftJoinAndSelect('kredit.approver', 'approver')
        .leftJoinAndSelect('kredit.document', 'document')
        .where(`kredit.kredit_code = :kode`, { kode: kredit_code });

      if (user.level != 'owner') {
        detail.andWhere(`kredit.user_id = :userId`, { userId: user.id });
      }
      const result = await detail.getOne();

      return this.responseService.success(true, 'Detail kredit', result || {});
    } catch (error) {
      Logger.log('[ERROR] DETAIL KREDIT =>', error);
      throw error;
    }
  }

  async CreateKredit(user: any, param: CreateKredit, files: any): Promise<any> {
    try {
      const checkUserId = await this.userService.findCompleteProfile(
        'profile.user_id = :userId',
        { userId: param?.user_id },
      );

      if (checkUserId && checkUserId?.pekerjaan && checkUserId?.rekomendasi) {
        const kreditData: Partial<KreditDocument> = {
          kredit_code: randomUUID().split('-')[0],
          user_id: checkUserId.user_id,
          status: StatusKredit.waiting,
          tanggal_pengajuan: new Date(),
          jenis_pembiayaan: param?.jenis_pembiayaan,
          nama_produk: param?.nama_produk,
          jenis_produk: param?.jenis_produk,
          tipe_produk: param?.tipe_produk,
          ukuran_produk: param?.ukuran_produk,
          warna_produk: param?.warna_produk,
          harga_produk: Number(param?.harga_produk),
          spesifikasi: param?.spesifikasi,
          tenor: Number(param?.tenor),
          dp: Number(param?.dp),
          cicilan: Number(param?.cicilan),
        };

        Logger.log('KREDIT DATA', kreditData);
        const processingImg = await this.ImageProcessing(
          kreditData.kredit_code,
          files,
        );

        const docSupport: Partial<KreditSupportDocument> = {
          kredit_code: kreditData.kredit_code,
          ...processingImg,
        };

        const doSave = await this.kreditRepo
          .save(kreditData)
          .then(async (result) => {
            const docSave = await this.kreditSuppRepo
              .save(docSupport)
              .catch((err) => {
                throw err;
              });
            return {
              kreditInfo: result,
              documents: docSave,
            };
          })
          .catch((err) => {
            throw err;
          });

        return this.responseService.success(
          true,
          'Kredit telah dibuat',
          doSave,
        );
      }
      const response: RMessage = {
        constraint: ['profile', 'pekerjaan', 'rekomendasi'],
        property: 'form tidak lengkap',
        value: 'lengkapi dahulu profilnya',
      };
      return this.responseService.error(HttpStatus.BAD_REQUEST, response);
    } catch (error) {
      Logger.log('[ERROR] CREATE KREDIT => ', error);
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        error,
        'Terjadi kesalahan pada server dalam mengolah data',
      );
    }
  }

  async ImageProcessing(
    kredit_code: any,
    files: any[],
  ): Promise<Record<string, string>> {
    try {
      const newDestination = `./uploads/kredit`;
      const newImagePath = `${newDestination}/${kredit_code}`;
      const result = {};
      if (files) {
        if (!fs.existsSync(newImagePath)) {
          fs.mkdirSync(newImagePath, { recursive: true });
        }

        for (const items in files) {
          const path = files[items][0]?.path;
          const imgPath = newImagePath + '/' + files[items][0]?.filename;
          result[items] = files[items][0]?.filename;
          fs.readFile(path, function (err, data) {
            fs.writeFile(imgPath, data, function (err) {
              if (err) {
                throw err;
              }
            });
            if (err) {
              throw err;
            }
          });

          fs.unlink(path, function (err) {
            if (err) throw err;
          });
        }
      }
      return result;
    } catch (err) {
      Logger.log('[ERROR] UPLOAD KREDIT => ', err);
      return {};
    }
  }

  async ChangeStatus(user: any, param: any) {
    try {
      const kreditDetail = await this.DetailKredit(user, param?.kredit_code);
      if (kreditDetail) {
        // UBAH STATUS KREDIT
        const kreditData: Partial<KreditDocument> = {
          id: kreditDetail?.data?.id,
          kredit_code: kreditDetail?.data?.kredit_code,
        };

        if (param?.status === StatusKredit.verified) {
          kreditData.status = StatusKredit.verified;
          kreditData.verify_at = new Date();
          kreditData.verificator_id = user.id;
        }

        if (param?.status === StatusKredit.approved) {
          kreditData.status = StatusKredit.approved;
          kreditData.tanggal_approval = new Date();
          kreditData.approver_id = user.id;
        }

        if (param?.status === StatusKredit.reject) {
          kreditData.status = StatusKredit.reject;
          kreditData.rejected_at = new Date();
          kreditData.notes = param?.notes || '';
        }

        await this.kreditRepo.save(kreditData);
        return this.responseService.success(
          true,
          'Status kredit telah diubah',
          kreditData,
        );
      }
    } catch (error) {
      Logger.log('[ERROR] STATUS KREDIT => ', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(user, param: KreditListDto) {
    try {
      const users = await this.ListKredit(user, param, true);
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
            constraint: ['Gagal mengunduh data kredit', error.message],
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
        'nama',
        'no handphone',
        'jenis pembiayaan',
        'tanggal pengajuan',
        'tanggal verifikasi',
        'tanggal approval',
        'tanggal akad',
        'tanggal jatuh tempo',
        'status',
        'nama produk',
        'jenis produk',
        'tipe produk',
        'ukuran produk',
        'warna produk',
        'spesifikasi',
        'tenor',
        'harga produk',
        'dp',
        'cicilan',
        'pembayaran terakhir',
        'notes',
      ],
    ];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items.kredit_code ? items.kredit_code.toUpperCase() : '',
          items.tanggal_pengajuan
            ? DatetimeHelper.UTCToLocaleDate(items.tanggal_pengajuan)
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
}
