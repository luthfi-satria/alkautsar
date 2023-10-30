import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsersDto, ListUser, UpdateUserDto } from './dto/users.dto';
import { randomUUID } from 'crypto';
import { genSaltSync, hash } from 'bcrypt';
import { UserDocuments } from '../database/entities/users.entity';
import { ResponseService } from '../response/response.service';
import { UsergroupDocument } from '../database/entities/usergroup.entity';
import { faker } from '@faker-js/faker';
import { Gender } from '../hash/guard/interface/user.interface';
import { RSuccessMessage } from '../response/response.interface';
import { join } from 'path';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { UserProfileDocuments } from '../database/entities/profile.entities';
import { updateProfileDto } from './dto/profile.dto';
import { DatetimeHelper } from '../helper/datetime.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserDocuments)
    private readonly usersRepo: Repository<UserDocuments>,
    @InjectRepository(UserProfileDocuments)
    private readonly profileRepo: Repository<UserProfileDocuments>,
    private readonly responseService: ResponseService,
    @InjectRepository(UsergroupDocument)
    private readonly groupRepo: Repository<UsergroupDocument>,
  ) {}

  protected readonly logger = new Logger(UsersService.name);

  async findOne(condition: string, search: any) {
    return await this.usersRepo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.profile', 'profile')
      .leftJoinAndSelect('users.usergroup', 'usergroup')
      .where(condition, search)
      .getOne();
  }

  async findCompleteProfile(condition: string, search: any) {
    return await this.profileRepo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.pekerjaan', 'pekerjaan')
      .leftJoinAndSelect('profile.rekomendasi', 'rekomendasi')
      .where(condition, search)
      .getOne();
  }

  async getOne(search: any) {
    return await this.usersRepo.findOneBy(search);
  }

  async register(data: CreateUsersDto) {
    try {
      const isExists = await this.profileRepo.findOneBy({
        email: data.email,
      });

      if (isExists) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: data.email,
            property: 'email',
            constraint: ['email sudah terdaftar!'],
          },
          'User sudah teregistrasi',
        );
      }

      const isPhoneExists = await this.profileRepo.findOneBy({
        phone: data.phone,
      });

      if (isPhoneExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: data.phone,
            property: 'phone',
            constraint: ['Nomor telepon sudah terdaftar!'],
          },
          'User sudah teregistrasi',
        );
      }

      const token = randomUUID();
      const password = await this.generateHashPassword(data.password);

      let groupWhere = {};

      if (data?.usergroup_id) {
        groupWhere = { id: Number(data?.usergroup_id) };
      } else {
        groupWhere = { is_default: true };
      }

      // Get usergroup
      const usergroup = await this.groupRepo.findOneBy(groupWhere);

      if (!usergroup) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: data.usergroup_id,
            property: 'usergroup',
            constraint: ['Usergroup tidak ditemukan!'],
          },
          'Usergroup tidak ditemukan',
        );
      }
      const newUser: Partial<UserDocuments> = {
        username: data.username,
        usergroup_id: usergroup.id,
        password: password,
        token_reset_password: token,
      };

      const newProfile: Partial<UserProfileDocuments> = {
        email: data.email,
        phone: data.phone,
      };

      const result: Record<string, any> = await this.usersRepo
        .save(newUser)
        .catch((e) => {
          Logger.error(e.message, '', 'Create User');
          throw e;
        })
        .then(async (e) => {
          return e;
        });

      if (result) {
        await this.profileRepo.save({ ...newProfile, login_account: result });
      }
      return this.responseService.success(
        true,
        'Sukses membuat user baru!',
        result,
      );
    } catch (err) {
      Logger.error(err.message, 'membuat user baru');
      throw err;
    }
  }

  async generateHashPassword(password: string): Promise<string> {
    const defaultSalt: number =
      Number(process.env.HASH_PASSWORDSALTLENGTH) || 10;
    const salt = genSaltSync(defaultSalt);
    return hash(password, salt);
  }

  async profile(id) {
    try {
      const getProfile = await this.usersRepo
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.profile', 'profile')
        .leftJoinAndSelect('users.usergroup', 'usergroup')
        .where(`users.id = :id`, { id: id })
        .getOne();

      if (getProfile) {
        ['password', 'token_reset_password'].forEach(
          (e) => delete getProfile[e],
        );
        return this.responseService.success(true, 'Akun user', getProfile);
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        value: id,
        property: 'id user',
        constraint: ['user tidak ditemukan'],
      });
    } catch (error) {
      Logger.log(error.message, 'Mengambil data profil gagal');
      throw error;
    }
  }

  async update(id, body: Partial<updateProfileDto>) {
    try {
      const verifyUser = await this.getOne({ id: id });
      if (verifyUser) {
        if (body.verify_at && body.verify_at == 'true') {
          body.verify_at = DatetimeHelper.CurrentDateTime('ISO');
        } else {
          body.verify_at = null;
        }
        // const updated = { ...body, verify_at: body?.verify_at || '' };
        // console.log('UPDATED', updated);
        // const saveUpdate = await this.profileRepo.save(updated);
        const saveUpdate = await this.profileRepo
          .createQueryBuilder()
          .update()
          .set(body)
          .where({ user_id: id })
          .execute();
        if (saveUpdate) {
          return this.responseService.success(
            true,
            'Akun user telah diperbaharui!',
          );
        }
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'Akun user',
            constraint: ['Akun user gagal diperbaharui!'],
          },
          'Akun user gagal diperbaharui!',
        );
      }

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Akun user',
          constraint: ['Akun user tidak ditemukan!'],
        },
        'Akun user tidak ditemukan',
      );
    } catch (error) {
      Logger.log(error.message, 'pembaharuan profil tidak berhasil');
      throw error;
    }
  }

  async updateUserLogin(id, body: Partial<UpdateUserDto>) {
    try {
      const verifyUser = await this.usersRepo.findOneBy({ id: id });
      if (verifyUser) {
        // Get usergroup
        const usergroup = await this.groupRepo.findOneBy({
          id: Number(body.usergroup_id),
        });
        if (!usergroup) {
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: id,
              property: 'usergroup',
              constraint: ['Usergroup tidak ditemukan!'],
            },
            'Usergroup tidak ditemukan',
          );
        }

        if (body.password && body.password != '') {
          body.password = await this.generateHashPassword(body.password);
        } else {
          delete body.password;
        }
        verifyUser.usergroup_id = usergroup.id;
        const updated = Object.assign(verifyUser, body);
        delete updated?.usergroup;
        const saveUpdate = await this.usersRepo.update({ id: id }, updated);
        if (saveUpdate) {
          return this.responseService.success(
            true,
            'akun user telah diperbaharui!',
          );
        }
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'akun user',
            constraint: ['akun user gagal diperbaharui!'],
          },
          'akun user gagal diperbaharui!',
        );
      }

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'akun user',
          constraint: ['akun user tidak ditemukan!'],
        },
        'akun user tidak ditemukan',
      );
    } catch (error) {
      Logger.log(error.message, 'pembaharuan profil tidak berhasil');
      throw error;
    }
  }

  async listUser(param: ListUser, raw = false) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;

      const query = this.usersRepo.createQueryBuilder('user');
      if (raw == false) {
        query
          .select([
            'user.id',
            'user.username',
            'profile.name',
            'profile.email',
            'profile.phone',
            'profile.gender',
            'profile.verify_at',
            'user.usergroup',
            'user.created_at',
            'group.name',
            'group.level',
          ])
          .leftJoin('user.profile', 'profile')
          .leftJoin('user.usergroup', 'group');
      } else {
        query
          .leftJoinAndSelect('user.profile', 'profile')
          .leftJoinAndSelect('user.usergroup', 'group');
      }

      const filter: any = [];

      if (Object.keys(param).length > 0) {
        for (const items in param) {
          if (
            ['limit', 'page', 'skip', 'status'].includes(items) == false &&
            param[items] != ''
          ) {
            const filterVal =
              items == 'usergroup_id'
                ? ['=', param[items]]
                : ['LIKE', `'%${param[items]}%'`];
            const flags = ['name', 'email', 'phone', 'gender'].includes(items)
              ? 'profile'
              : 'user';
            filter.push(`${flags}.${items} ${filterVal[0]} ${filterVal[1]}`);
          }
        }

        if (param?.status && param?.status == 'baru') {
          filter.push(`profile.verify_at IS NULL`);
        } else if (param?.status && param?.status == 'lama') {
          filter.push(`profile.verify_at IS NOT NULL`);
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
        message: 'Get List users success',
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
      Logger.error(err.message, 'Users gagal ditampilkan');
      throw err;
    }
  }

  /**
   * UPLOAD FOTO
   */

  async uploadImage(id: string, file: any) {
    try {
      if (id && id != ':id') {
        const path = file.path;
        const newDestination = `./uploads/photos/${id}`;
        const newImagePath = `${newDestination}/${file.filename}`;
        const profileUser = await this.profileRepo.findOneBy({
          user_id: Number(id),
        });
        if (profileUser) {
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

          // HANDLE DATA => UPDATE USER PROFILE PHOTO
          await this.profileRepo.save({
            ...profileUser,
            photo: file.filename,
          });
          return this.responseService.success(
            true,
            'Akun user telah diperbaharui!',
            {
              photo: file.filename,
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
              property: 'Akun user',
              constraint: ['Akun user tidak ditemukan!'],
            },
            'Akun user tidak ditemukan',
          );
        }
      }
    } catch (err) {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.log('CATCH ERROR', error);
        }
      });
      Logger.log(err.message, 'pembaharuan profil tidak berhasil');
      throw err;
    }
  }

  async readPhoto(id: string) {
    try {
      const getProfile = await this.profileRepo.findOneBy({
        user_id: Number(id),
      });
      if (getProfile) {
        return getProfile;
      }
      return {};
    } catch (error) {
      Logger.error('Terjadi galat pada sistem', error);
      throw error;
    }
  }

  /**
   * SEEDING
   * @param total_user
   * @returns
   */
  async seeding(total_user: number) {
    try {
      const userData: any = [];
      const usergroup = await this.groupRepo.findOneBy({
        is_default: true,
      });
      for (let item = 0; item < total_user; item++) {
        const user: Partial<UserDocuments> = {
          username: faker.internet.userName(),
          password: await this.generateHashPassword(faker.internet.password()),
          usergroup_id: usergroup?.id,
        };

        const Ins = await this.usersRepo.save(user);

        const profile: Partial<UserProfileDocuments> = {
          name: faker.person.fullName(),
          gender: Gender[faker.person.sex()] || Gender.Male,
          alamat: faker.location.streetAddress(),
          kelurahan: faker.location.street(),
          kecamatan: faker.location.county(),
          kota: faker.location.city(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          dob_place: faker.location.city(),
          dob: faker.date.birthdate(),
          ktp: String(faker.number.int()),
          masa_berlaku: faker.date.future(),
          login_account: Ins,
        };

        userData.push(profile);
      }

      if (userData.length > 0) {
        const bulkIns = await this.profileRepo.save(userData);
        if (bulkIns) {
          return {
            code: HttpStatus.OK,
            message: 'user dummy seeding has been completed',
          };
        }
      }

      return {
        code: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'User dummy failed to generate',
      };
    } catch (error) {
      Logger.log(error.message, 'Seeding data is aborting, file is not exists');
      throw error;
    }
  }

  async createAdmin() {
    const adminData = fs.readFileSync(
      join(process.cwd(), 'src/database/seeds/data/initial_admin.data.json'),
      'utf-8',
    );
    const data = JSON.parse(adminData);
    const token = randomUUID();
    const password = await this.generateHashPassword(data.login.password);
    // Get usergroup
    const usergroup = await this.groupRepo.findOneBy({
      name: data.login.usergroup,
      level: data.login.level,
    });

    if (!usergroup) {
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: data.login.usergroup,
          property: 'usergroup',
          constraint: ['Usergroup tidak ditemukan!'],
        },
        'Usergroup tidak ditemukan',
      );
    }
    const newUser = {
      ...data.login,
      usergroup_id: usergroup.id,
      password: password,
      token_reset_password: token,
    };

    const replacement = await this.usersRepo.insert(newUser);
    if (replacement) {
      await this.profileRepo
        .save({
          ...data.profile,
          user_id: replacement.identifiers[0].id,
        })
        .catch((err) => {
          this.logger.log('ERROR ', err);
        });
    }
    return replacement;
  }

  /** REPORT */

  async exportExcel(param: ListUser) {
    try {
      const users = await this.listUser(param, true);
      const excelObjects = await this.createExcelObjects(users);
      return excelObjects;

      // return this.createExcelObjects(param, excelObjects);
    } catch (error) {
      this.logger.log(error);
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
        'Nama',
        'Email',
        'No. Handphone',
        'KTP',
        'Masa Berlaku',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Jenis Kelamin',
        'Pendidikan',
        'Status',
        'Alamat',
        'Kelurahan',
        'Kecamatan',
        'Kota',
        'Status Kepemilikan',
        'Verifikasi',
        'Level',
        'Group',
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
          items.profile_ktp ? items.profile_ktp : '',
          items.profile_masa_berlaku ? items.profile_masa_berlaku : '',
          items.profile_dob_place ? items.profile_dob_place : '',
          items.profile_dob ? items.profile_dob : '',
          items.profile_gender == 'male' ? 'Laki-laki' : 'Perempuan',
          items.profile_education ? items.profile_education : '',
          items.profile_marital_status ? items.profile_marital_status : '',
          items.profile_alamat ? items.profile_alamat : '',
          items.profile_kelurahan ? items.profile_kelurahan : '',
          items.profile_kecamatan ? items.profile_kecamatan : '',
          items.profile_kota ? items.profile_kota : '',
          items.profile_status_kepemilikan
            ? items.profile_status_kepemilikan
            : '',
          items.profile_verify_at ? 'Terverifikasi' : 'Belum verifikasi',
          items.group_level ? items.group_level : '',
          items.group_name ? items.group_name : '',
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
