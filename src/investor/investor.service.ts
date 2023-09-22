import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvestorDocuments } from '../database/entities/investor.entities';
import { MoreThan, Repository } from 'typeorm';
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
            'profile.name',
            'profile.email',
            'profile.phone',
            'profile.gender',
            'profile.verify_at',
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

        if (param?.is_verified) {
          filter.push(`profile.verify_at IS NOT NULL`);
        } else {
          filter.push(`profile.verify_at IS NULL`);
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
          .skip(skip)
          .take(limit)
          .getManyAndCount();
      } else {
        count = await query.getCount();
        findQuery = await query.offset(skip).limit(limit).getRawMany();
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
        .where(`inv.id = :id`, { id: id })
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

      const invest: Partial<InvestorDocuments> = {
        ...data,
        tanggal_investasi: new Date(
          DatetimeHelper.CurrentDateTime('ISO').substring(0, 10),
        ),
        tanggal_kadaluarsa: new Date(
          DatetimeHelper.setExpiredTime(data.jangka_waktu).substring(0, 10),
        ),
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
      Logger.log('ERROR', error);
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
          'User sudah teregistrasi',
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

      if (isVerified) {
        invest.verify_at = DatetimeHelper.CurrentDateTime('ISO');
      }

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
      Logger.log('ERROR', error);
      throw error;
    }
  }

  async DeleteInvestor(id: string) {
    return id;
  }

  async ReactivateInvestor(id, data){
    return data;
  }
}
