import {
  Injectable,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvestorDocuments } from '../database/entities/investor.entities';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { ResponseService } from '../response/response.service';
import {
  CreateInvestorDto,
  ListInvestorDto,
  UpdateInvestorDto,
} from './dto/investor.dto';
import { RSuccessMessage } from '../response/response.interface';
import { UsersService } from '../users/users.service';
import { DatetimeHelper } from '../helper/datetime.helper';

@Injectable()
export class InvestorService {
  constructor(
    @InjectRepository(InvestorDocuments)
    private readonly investorRepo: Repository<InvestorDocuments>,
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  async ListInvestor(param: ListInvestorDto, raw = false) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;

      const query = this.investorRepo.createQueryBuilder('inv');
      if (raw == false) {
        query
          .select([
            'inv.user_id',
            'inv.nilai',
            'inv.jangka_waktu',
            'inv.no_rekening',
            'inv.bank',
            'inv.tanggal_investasi',
            'inv.tanggal_kadaluarsa',
            'inv.verify_at',
            'inv.deleted_at',
            'profile.name',
            'profile.email',
            'profile.phone',
            'profile.gender',
          ])
          .leftJoin('inv.profile', 'profile');
      } else {
        query.leftJoinAndSelect('inv.profile', 'profile');
      }

      const filter: any = [];
      if (Object.keys(param).length > 0) {
        for (const items in param) {
          if (
            ['limit', 'page', 'skip', 'is_verified'].includes(items) == false &&
            param[items] != ''
          ) {
            const filterVal =
              items == 'usergroup_id'
                ? ['=', param[items]]
                : ['LIKE', `'%${param[items]}%'`];
            const flags = ['name', 'email', 'phone', 'gender'].includes(items)
              ? 'profile'
              : 'inv';
            filter.push(`${flags}.${items} ${filterVal[0]} ${filterVal[1]}`);
          }
        }

        if (param?.is_verified == 'sudah') {
          filter.push(`inv.verify_at IS NOT NULL`);
        } else if (param?.is_verified == 'belum') {
          filter.push(`inv.verify_at IS NULL`);
        }

        if (filter.length > 0) {
          const queryFilter = filter.join(' AND ');
          query.where(queryFilter);
        }
      }

      let findQuery = {};
      let count = 0;

      if (raw == false) {
        [findQuery, count] = await query
          .withDeleted()
          .skip(skip)
          .take(limit)
          .getManyAndCount();
      } else {
        count = await query.getCount();
        findQuery = await query
          .withDeleted()
          .offset(skip)
          .limit(limit)
          .getRawMany();
      }

      const results: RSuccessMessage = {
        success: true,
        message: 'Get List Investor success',
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
      Logger.error(err.message, 'Investor gagal ditampilkan');
      throw err;
    }
  }

  async DetailInvestor(id) {
    try {
      const getProfile = await this.investorRepo
        .createQueryBuilder('inv')
        .leftJoinAndSelect('inv.profile', 'profile')
        .where(`inv.user_id = :id`, { id: id })
        .getOne();

      if (getProfile) {
        return this.responseService.success(true, 'Investor', getProfile);
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        value: id,
        property: 'id investor',
        constraint: ['investor tidak ditemukan'],
      });
    } catch (error) {
      Logger.log(error.message, 'Mengambil data profil gagal');
      throw error;
    }
  }

  async CreateInvestor(data: CreateInvestorDto) {
    try {
      const profile = await this.usersService.findOne(
        'profile.user_id = :user_id',
        { user_id: data.user_id },
      );

      if (!profile) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(data.user_id),
            property: 'user_id',
            constraint: ['profil tidak ditemukan!'],
          },
          'User sudah teregistrasi',
        );
      }

      const getInvestor = await this.investorRepo.findOneBy({
        user_id: data.user_id,
      });

      if (getInvestor) {
        return this.responseService.error(
          HttpStatus.NOT_ACCEPTABLE,
          {
            constraint: ['user id'],
            property: 'user_id',
            value: String(data.user_id),
          },
          'User tersebut telah terdaftar sebagai investor',
        );
      }

      const isVerified = data?.is_verified;
      delete data?.is_verified;
      const invest = {
        ...data,
        no_investasi: data?.no_investasi,
        tanggal_investasi: new Date(
          DatetimeHelper.CurrentDateTime('ISO').substring(0, 10),
        ),
        tanggal_kadaluarsa: new Date(
          DatetimeHelper.setExpiredTime(data.jangka_waktu).substring(0, 10),
        ),
        verify_at: isVerified ? new Date() : null,
      };

      const result = await this.investorRepo
        .save(invest)
        .catch((e) => {
          Logger.error(e.message, '', 'Create investor');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menambah investor baru!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] CREATE INVESTOR =>', error);
      throw error;
    }
  }

  async UpdateInvestor(id, data: UpdateInvestorDto) {
    try {
      const profile = await this.investorRepo.findOneBy({
        user_id: id,
        tanggal_kadaluarsa: MoreThan(new Date()),
      });

      if (!profile) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(id),
            property: 'user_id',
            constraint: [
              'profil tidak ditemukan, atau investasi telah kadaluarsa, silahkan lakukan aktivasi ulang!',
            ],
          },
          'status investor sudah kadaluarsa',
        );
      }
      const isVerified = data.is_verified;
      delete data.is_verified;
      const invest: Partial<InvestorDocuments> = {
        ...profile,
        ...data,
      };

      if (profile.jangka_waktu != data.jangka_waktu) {
        invest.tanggal_kadaluarsa = new Date(
          DatetimeHelper.setExpiredTime(
            data.jangka_waktu,
            0,
            0,
            String(profile.tanggal_investasi),
          ).substring(0, 10),
        );
      }

      invest.verify_at = isVerified
        ? DatetimeHelper.CurrentDateTime('ISO')
        : null;

      const result = await this.investorRepo
        .save(invest)
        .catch((e) => {
          Logger.error(e.message, '', 'Update investor');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses update investor data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] UPDATE INVESTOR =>', error);
      throw error;
    }
  }

  async DeleteInvestor(id: string) {
    try {
      const result = await this.investorRepo
        .createQueryBuilder()
        .softDelete()
        .where('user_id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] DELETE INVESTOR');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses menghapus investor data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] DELETE INVESTOR =>', error);
      throw error;
    }
  }

  async RestoreInvestor(id: string) {
    try {
      const result = await this.investorRepo
        .createQueryBuilder()
        .restore()
        .where('user_id = :id', { id: id })
        .execute()
        .catch((e) => {
          Logger.error(e.message, '', '[ERROR] RESTORE INVESTOR');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses mengembalikan investor data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] RESTORE INVESTOR =>', error);
      throw error;
    }
  }

  async ReactivateInvestor(id) {
    try {
      const currentDate = DatetimeHelper.CurrentDateTime('ISO');
      const findInvestor = await this.investorRepo.findOneBy({
        user_id: id,
        tanggal_kadaluarsa: LessThanOrEqual(currentDate),
      });

      if (!findInvestor) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: String(id),
            property: 'investor id',
            constraint: ['profil tidak ditemukan!'],
          },
          'profil tidak ditemukan',
        );
      }

      const newExp = DatetimeHelper.setExpiredTime(
        findInvestor.jangka_waktu,
        0,
        0,
        currentDate,
      );

      const updateData = {
        ...findInvestor,
        tanggal_investasi: currentDate,
        tanggal_kadaluarsa: newExp,
      };

      const result = await this.investorRepo
        .save(updateData)
        .catch((e) => {
          Logger.error(e.message, '', 'Reaktivasi investor');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Sukses reaktiVasi investor data!',
        result,
      );
    } catch (error) {
      Logger.log('[ERROR] REACTIVATE INVESTOR =>', error);
      throw error;
    }
  }

  /** REPORT */

  async exportExcel(param: ListInvestorDto) {
    try {
      const users = await this.ListInvestor(param, true);
      const excelObjects = await this.createExcelObjects(users);
      return excelObjects;

      // return this.createExcelObjects(param, excelObjects);
    } catch (error) {
      Logger.log('[ERROR] EXPORT EXCEL => ', error);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: '',
            constraint: ['Gagal mengunduh data investor', error.message],
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
        'Nama',
        'Email',
        'No. Handphone',
        'No Investasi',
        'Nilai',
        'Jangka Waktu',
        'Bank',
        'No Rekening',
        'Tanggal Investasi',
        'Tanggal Kadaluarsa',
        'Status Verifikasi',
        'Status',
      ],
    ];

    if (excelObjects.data.items) {
      let i = 1;
      for (const items of excelObjects.data.items) {
        rows.push([
          i,
          items.profile_name ? items.profile_name : '',
          items.profile_email ? items.profile_email : '',
          items.profile_phone ? items.profile_phone : '',
          items.no_investasi ? items.no_investasi : '',
          items.inv_nilai ? items.inv_nilai : '',
          items.inv_jangka_waktu ? items.inv_jangka_waktu : '',
          items.inv_bank ? items.inv_bank : '',
          items.inv_no_rekening ? items.inv_no_rekening : '',
          items.inv_tanggal_investasi ? items.inv_tanggal_investasi : '',
          items.inv_tanggal_kadaluarsa ? items.inv_tanggal_kadaluarsa : '',
          items.inv_verify_at ? 'Terverifikasi' : 'Belum Verifikasi',
          items.inv_deleted_at ? 'Aktif' : 'Tidak aktif',
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

  async Statistics(nYear = '') {
    try {
      const selectedYear = nYear || 'YEAR()';
      const total = await this.investorRepo
        .createQueryBuilder()
        .where(
          `:year BETWEEN YEAR(tanggal_investasi) AND YEAR(tanggal_kadaluarsa)`,
          { year: selectedYear },
        )
        .getCount();

      const total_invest = await this.investorRepo
        .createQueryBuilder()
        .select('SUM(nilai) AS total_investasi')
        .where(
          ':year BETWEEN YEAR(tanggal_investasi) AND YEAR(tanggal_kadaluarsa)',
          { year: selectedYear },
        )
        .getRawOne();
      return {
        total: total,
        total_investasi: total_invest?.total_investasi || 0,
      };
    } catch (error) {
      return error;
    }
  }

  async ActiveInvestorListQuery() {
    const query = this.investorRepo.createQueryBuilder('inv');
    query
      .select([
        'inv.nilai',
        'inv.jangka_waktu',
        'inv.tanggal_investasi',
        'inv.tanggal_kadaluarsa',
        'profile.name',
      ])
      .leftJoin('inv.profile', 'profile')
      .where('inv.tanggal_kadaluarsa >= NOW()')
      .andWhere('inv.verify_at IS NOT NULL');

    let findQuery = {};
    let count = 0;

    count = await query.getCount();
    findQuery = await query.getRawMany();
    return {
      count: count,
      investor: findQuery,
    };
  }

  async ActiveInvestorList() {
    try {
      const investor = await this.ActiveInvestorListQuery();
      const results: RSuccessMessage = {
        success: true,
        message: 'Get List Investor Aktif success',
        data: {
          total: investor?.count,
          items: investor?.investor,
        },
      };

      return results;
    } catch (err) {
      Logger.error(err.message, 'Investor gagal ditampilkan');
      throw err;
    }
  }
}
