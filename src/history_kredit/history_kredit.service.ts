import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import { KreditHistoryListDto } from '../kredit/dto/kredit.dto';
import { RSuccessMessage } from '../response/response.interface';
import { DatetimeHelper } from '../helper/datetime.helper';
import { KreditPaymentDocument } from '../kredit/entities/kredit_payment.entities';

@Injectable()
export class HistoryKreditService {
  constructor(
    @InjectRepository(KreditPaymentDocument)
    private readonly historyRepo: Repository<KreditPaymentDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async ListHistoryKredit(
    user: any,
    param: KreditHistoryListDto,
    raw = false,
  ): Promise<any> {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      let where = {};
      let profile = {};

      if (param?.profile_name) {
        profile = {
          ...profile,
          name: Like(`%${param.profile_name}%`),
        };
      }

      if (param?.kredit_code) {
        where = { ...where, kredit_code: param.kredit_code };
      }

      if (param?.payment_method) {
        where = { ...where, payment_method: param.payment_method };
      }

      if (param?.payment_date) {
        const tglPengajuan = param?.payment_date.split(':');
        where = {
          ...where,
          payment_date: Between(
            tglPengajuan[0] + ' 00:00:00',
            tglPengajuan[1] + ' 23:59:59',
          ),
        };
      }

      if (param?.verify_at) {
        const tglPengajuan = param?.verify_at.split(':');
        where = {
          ...where,
          verify_at: Between(
            tglPengajuan[0] + ' 00:00:00',
            tglPengajuan[1] + ' 23:59:59',
          ),
        };
      }

      if (param?.profile_phone) {
        profile = {
          ...profile,
          phone: Like(`%${param.profile_phone}%`),
        };
      }

      if (Object.keys(profile).length > 0) {
        where = {
          ...where,
          kredit: {
            profile: profile,
          },
        };
      }

      const query = this.historyRepo.createQueryBuilder('history');
      if (raw == false) {
        query
          .leftJoinAndSelect('history.kredit', 'kredit')
          .leftJoinAndSelect('kredit.profile', 'profile')
          .leftJoinAndSelect('history.verificator', 'verificator');
      } else {
        query
          .leftJoinAndSelect('history.kredit', 'kredit')
          .leftJoinAndSelect('kredit.profile', 'profile')
          .leftJoinAndSelect('history.verificator', 'verificator');
      }

      if (where) {
        query.where(where);
      }

      const orientation =
        param?.orientation && param?.orientation.toLowerCase() == 'asc'
          ? 'ASC'
          : 'DESC';
      if (param?.order_by && param.order_by != '') {
        query.orderBy('history.' + param.order_by, orientation);
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
        message: 'Get list history success',
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
      Logger.error(err.message, 'Riwayat kredit gagal ditampilkan');
      throw err;
    }
  }

  /** REPORT */

  async exportExcel(user, param: KreditHistoryListDto) {
    try {
      const users = await this.ListHistoryKredit(user, param, false);
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
            constraint: ['Gagal mengunduh data riwayat kredit', error.message],
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
        'metode bayar',
        'tanggal pembayaran',
        'tanggal verifikasi',
        'status',
        'jumlah bayar',
        'nama bank',
        'no rekening',
        'pemilik rekening',
        'rekening tujuan',
        'no ref',
      ],
    ];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items?.kredit_code?.toUpperCase(),
          items?.kredit?.profile?.name,
          items?.kredit?.profile?.phone,
          items?.payment_method,
          items?.payment_date
            ? DatetimeHelper.UTCToLocaleDate(items.payment_date)
            : '',
          items?.verify_at
            ? DatetimeHelper.UTCToLocaleDate(items.verify_at)
            : '',
          items?.verify_at ? 'Terverifikasi' : '',
          items?.jml_bayar,
          items?.bank_name,
          items?.nomor_rekening,
          items?.pemilik_rekening,
          items?.rekening_tujuan,
          items?.no_referensi,
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
      const stats = await this.historyRepo
        .createQueryBuilder()
        .select(['SUM(jml_bayar) AS total_bayar_in_week', `payment_method`])
        .where('created_at >= NOW() - INTERVAL 7 DAY')
        .andWhere('verify_at IS NOT NULL')
        .andWhere('payment_date IS NOT NULL')
        .groupBy(`payment_method`)
        .getRawMany();

      return {
        stats: stats,
      };
    } catch (error) {
      return error;
    }
  }
}
