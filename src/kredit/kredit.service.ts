import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { RMessage, RSuccessMessage } from '../response/response.interface';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { DatetimeHelper } from '../helper/datetime.helper';
import { KreditDocument } from './entities/kredit.entities';
import { KreditSupportDocument } from './entities/kredit_support.entities';
import { BayarKreditDto, CreateKredit, KreditListDto } from './dto/kredit.dto';
import { StatusKredit } from './interface/kredit_status.interface';
import { UsersService } from '../users/users.service';
import { join } from 'path';
import { KreditPaymentDocument } from './entities/kredit_payment.entities';

@Injectable()
export class KreditService {
  constructor(
    @InjectRepository(KreditDocument)
    private readonly kreditRepo: Repository<KreditDocument>,
    @InjectRepository(KreditSupportDocument)
    private readonly kreditSuppRepo: Repository<KreditSupportDocument>,
    @InjectRepository(KreditPaymentDocument)
    private readonly kreditPaymentRepo: Repository<KreditPaymentDocument>,
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

      if (param?.tanggal_pengajuan) {
        const tglPengajuan = param?.tanggal_pengajuan.split(':');
        where = {
          ...where,
          tanggal_pengajuan: Between(
            tglPengajuan[0] + ' 00:00:00',
            tglPengajuan[1] + ' 23:59:59',
          ),
        };
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
          tanggal_akad: new Date(param?.tanggal_akad),
          tanggal_jatuh_tempo: Number(param?.tanggal_jatuh_tempo),
          notes: param?.notes,
        };

        Logger.log('KREDIT DATA', kreditData);
        const processingImg = await this.ImageProcessing(
          kreditData.kredit_code,
          files,
          {},
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

  async UpdateKredit(
    user: any,
    kredit_code: string,
    param: CreateKredit,
    files: any,
  ): Promise<any> {
    try {
      const getKredit = await this.kreditRepo.findOneBy({
        kredit_code: kredit_code,
      });

      if (getKredit) {
        const kreditData: Partial<KreditDocument> = {
          ...getKredit,
          jenis_pembiayaan: param?.jenis_pembiayaan,
          nama_produk: param?.nama_produk,
          jenis_produk: param?.jenis_produk,
          tipe_produk: param?.tipe_produk,
          ukuran_produk: param?.ukuran_produk,
          warna_produk: param?.warna_produk,
          tanggal_akad: new Date(param?.tanggal_akad),
          tanggal_jatuh_tempo: Number(param?.tanggal_jatuh_tempo),
          harga_produk: Number(param?.harga_produk),
          spesifikasi: param?.spesifikasi,
          tenor: Number(param?.tenor),
          dp: Number(param?.dp),
          cicilan: Number(param?.cicilan),
          notes: param?.notes,
        };

        const kreditDoc = await this.kreditSuppRepo.findOneBy({
          kredit_code: kredit_code,
        });

        Logger.log('KREDIT DATA', {
          kredit: kreditData,
          document: kreditDoc,
        });
        const processingImg = await this.ImageProcessing(
          kreditData.kredit_code,
          files,
          kreditDoc,
        );

        const docSupport: Partial<KreditSupportDocument> = {
          ...kreditDoc,
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
    kreditDocData: any,
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

          if (kreditDocData?.[items] && kreditDocData?.[items] != '') {
            const oldFilePath = newImagePath + '/' + kreditDocData?.[items];
            if (fs.existsSync(oldFilePath)) {
              fs.unlink(join(process.cwd(), oldFilePath), function (error) {
                if (error) {
                  throw error;
                }
              });
            }
          }

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

        if (param?.status === StatusKredit.ongoing) {
          kreditData.status = StatusKredit.ongoing;
        }

        if (param?.status === StatusKredit.done) {
          kreditData.status = StatusKredit.done;
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

  /** PEMBAYARAN */
  async BayarKredit(user: any, body: BayarKreditDto, files: any) {
    try {
      const kreditDetail = await this.kreditRepo.findOneBy({
        kredit_code: body?.kredit_code,
      });

      if (kreditDetail) {
        const payment: Partial<KreditPaymentDocument> = {
          kredit_code: kreditDetail?.kredit_code,
          jml_bayar: Number(body?.jml_bayar),
          payment_method: body?.payment_method,
          nomor_rekening: body?.nomor_rekening,
          pemilik_rekening: body?.pemilik_rekening,
          bank_name: body?.bank_name,
          no_referensi: body?.no_referensi,
          rekening_tujuan: body?.rekening_tujuan,
          payment_date: body?.payment_date,
          verificator_id: user.id,
          verify_at: new Date(),
        };

        const { bukti_payment } = await this.ImageProcessing(
          payment.kredit_code,
          files,
          {},
        );

        payment.bukti_payment = bukti_payment;

        const doSave = await this.kreditPaymentRepo
          .save(payment)
          .then(async (result) => {
            const updateKredit = await this.kreditRepo
              .save({ ...kreditDetail, last_payment: payment.payment_date })
              .catch((err) => {
                throw err;
              });
            return {
              paymentInfo: result,
              kredit: updateKredit,
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
    } catch (error) {
      Logger.log('[ERROR] BAYAR KREDIT => ', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(user, param: KreditListDto) {
    try {
      const users = await this.ListKredit(user, param, false);
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
        'kode',
        'nama',
        'no handphone',
        'tanggal pengajuan',
        'tanggal verifikasi',
        'tanggal approval',
        'tanggal akad',
        'tanggal jatuh tempo',
        'status',
        'jenis pembiayaan',
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
          items?.kredit_code?.toUpperCase(),
          items?.profile?.name,
          items?.profile?.phone,
          items.tanggal_pengajuan
            ? DatetimeHelper.UTCToLocaleDate(items.tanggal_pengajuan)
            : '',
          items.verify_at
            ? DatetimeHelper.UTCToLocaleDate(items.verify_at)
            : '',
          items.tanggal_approval
            ? DatetimeHelper.UTCToLocaleDate(items.tanggal_approval)
            : '',
          items.tanggal_akad
            ? DatetimeHelper.UTCToLocaleDate(items.tanggal_akad)
            : '',
          items.tanggal_jatuh_tempo,
          items.status,
          items.jenis_pembiayaan,
          items.nama_produk,
          items.jenis_produk,
          items.tipe_produk,
          items.ukuran_produk,
          items.warna_produk,
          items.spesifikasi,
          items.tenor,
          items.harga_produk,
          items.dp,
          items.cicilan,
          items.last_payment
            ? DatetimeHelper.UTCToLocaleDate(items.last_payment)
            : '',
          items.notes,
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
      const stats = await this.kreditRepo
        .createQueryBuilder()
        .select(['COUNT(id) AS total', `status`])
        .andWhere('tanggal_pengajuan + INTERVAL tenor MONTH >= NOW()')
        .groupBy(`status`)
        .getRawMany();

      const total_invest = await this.kreditRepo
        .createQueryBuilder()
        .select('SUM(harga_produk) AS total_outcome')
        .where({ status: In(['Berlangsung', 'Menunggak']) })
        .andWhere('tanggal_akad + INTERVAL tenor MONTH >= NOW()')
        .getRawOne();
      return {
        stats: stats,
        active_outcome: total_invest?.total_outcome || 0,
      };
    } catch (error) {
      return error;
    }
  }
}
