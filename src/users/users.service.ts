import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsersDto, ListUser, UpdateUserDto } from './dto/users.dto';
import { randomUUID } from 'crypto';
import { genSaltSync, hash } from 'bcrypt';
import { UserDocuments } from '../database/entities/users.entity';
import { ResponseService } from '../response/response.service';
import { UsergroupDocument } from '../database/entities/usergroup.entity';
import { faker } from '@faker-js/faker';
import { Gender, UserType } from '../hash/guard/interface/user.interface';
import { RSuccessMessage } from '../response/response.interface';
import { join } from 'path';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { UserProfileDocuments } from '../database/entities/profile.entities';
import { updateProfileDto } from './dto/profile.dto';

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
          HttpStatus.CONFLICT,
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

      // Get usergroup
      const usergroup = await this.groupRepo.findOneBy({
        name: data.usergroup,
      });

      if (!usergroup) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: data.usergroup,
            property: 'usergroup',
            constraint: ['Usergroup tidak ditemukan!'],
          },
          'Usergroup tidak ditemukan',
        );
      }
      const newUser: Partial<UserDocuments> = {
        username: data.username,
        user_type: data.user_type,
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
        return this.responseService.success(true, 'user profile', getProfile);
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
        const updated = { ...body, user_id: id };
        const saveUpdate = await this.profileRepo.save(updated);
        if (saveUpdate) {
          return this.responseService.success(
            true,
            'user profile telah diperbaharui!',
          );
        }
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'user profile',
            constraint: ['user profile gagal diperbaharui!'],
          },
          'user profile gagal diperbaharui!',
        );
      }

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'user profile',
          constraint: ['user profile tidak ditemukan!'],
        },
        'user profile tidak ditemukan',
      );
    } catch (error) {
      Logger.log(error.message, 'pembaharuan profil tidak berhasil');
      throw error;
    }
  }

  async updateUserLogin(id, body: Partial<UpdateUserDto>) {
    try {
      const verifyUser = await this.getOne({ id: id });
      if (verifyUser) {
        // Get usergroup
        const usergroup = await this.groupRepo.findOneBy({
          name: body.usergroup,
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

        verifyUser.usergroup_id = usergroup.id;
        delete body.usergroup;
        const updated = Object.assign(verifyUser, body);

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

  async listUser(param: ListUser) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;

      const query = this.usersRepo
        .createQueryBuilder('user')
        .select([
          'user.id',
          'profile.name',
          'user.username',
          'user.email',
          'user.phone',
          'user.user_type',
          'user.usergroup',
          'user.verify_at',
          'user.created_at',
        ])
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.usergroup', 'group');
      const filter: any = [];
      if (Object.keys(param).length > 0) {
        for (const items in param) {
          if (['limit', 'page', 'skip'].includes(items) == false) {
            const filterVal =
              items == 'usergroup_id'
                ? ['=', param[items]]
                : ['LIKE', `'%${param[items]}%'`];
            filter.push(`user.${items} ${filterVal[0]} ${filterVal[1]}`);
          }
        }

        if (filter.length > 0) {
          const queryFilter = filter.join(' AND ');
          query.where(queryFilter);
        }
      }

      const [findQuery, count] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

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
      Logger.error(err.message, 'Users failed to fetch');
      throw err;
    }
  }

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
          user_type: UserType.User,
          usergroup_id: usergroup?.id,
        };

        const Ins = await this.usersRepo.save(user);

        const profile: Partial<UserProfileDocuments> = {
          name: faker.person.fullName(),
          gender: Gender.Male,
          email: faker.internet.email(),
          phone: faker.phone.number(),
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
}
