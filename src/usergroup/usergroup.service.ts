import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ListUsergroup, UsergroupDto } from './dto/usergroup.dto';
import { UsergroupDocument } from '../database/entities/usergroup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from '../response/response.service';
import * as fs from 'fs';
import { join } from 'path';
import { RSuccessMessage } from '../response/response.interface';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsergroupService {
  constructor(
    @InjectRepository(UsergroupDocument)
    private readonly usergroupRepo: Repository<UsergroupDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async getAll(param: ListUsergroup) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;
      let where = {};

      if (param?.level) {
        where = { ...where, level: param?.level };
      }

      if (param?.name) {
        where = { ...where, name: Like(`%${param?.name}%`) };
      }

      if (param?.is_default) {
        where = { ...where, is_default: param?.is_default };
      }

      const query = this.usergroupRepo.createQueryBuilder('group').where(where);

      const [findQuery, count] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const results: RSuccessMessage = {
        success: true,
        message: 'Get List usergroup success',
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
      Logger.error(err.message, 'Usergroup failed to fetch');
      throw err;
    }
  }

  async findOne(search: any) {
    return await this.usergroupRepo.findOneBy(search);
  }

  async create(body: UsergroupDto) {
    try {
      const isExists = await this.usergroupRepo.findOne({
        where: {
          name: body.name,
        },
      });

      if (isExists) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: body.name,
            property: 'name',
            constraint: ['usergroup name already registered!'],
          },
          'Usergroup name Already Exists',
        );
      }

      const saveUsergroup = await this.usergroupRepo
        .save(body)
        .catch((e) => {
          Logger.log(e.message, 'Create usergroup');
          throw e;
        })
        .then((e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Success Create usergroup!',
        saveUsergroup,
      );
    } catch (err) {
      Logger.error(err.message, 'Create new group failed');
      throw err;
    }
  }

  async update(id, body: UsergroupDto) {
    try {
      const isExists = await this.usergroupRepo.findOneBy({ id: id });

      if (!isExists) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: body.name,
            property: 'name',
            constraint: ['usergroup is not found!'],
          },
          'Usergroup is not found',
        );
      }

      const updated = Object.assign(isExists, body);

      const updateUsergroup = await this.usergroupRepo.save(updated);

      if (updateUsergroup) {
        return this.responseService.success(
          true,
          'user group has been updated!',
        );
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'user group',
          constraint: ['user group failed to update!'],
        },
        'user group failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Cannot update usergroup');
      throw err;
    }
  }

  async delete(id) {
    try {
      const isExists = await this.usergroupRepo.findOneBy({ id: id });
      if (!isExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: id,
            property: 'id',
            constraint: ['usergroup is not found'],
          },
          'Usergroup is not found',
        );
      }

      const deleteUsergroup = await this.usergroupRepo.softDelete({ id: id });

      if (deleteUsergroup) {
        return this.responseService.success(
          true,
          'user group has been updated!',
        );
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'user group',
          constraint: ['user group failed to update!'],
        },
        'user group failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Delete usergroup');
      throw err;
    }
  }

  async seeding() {
    try {
      const usergroupData = fs.readFileSync(
        join(process.cwd(), 'src/database/seeds/data/usergroup.data.json'),
        'utf-8',
      );

      const parseData: Partial<UsergroupDocument> = JSON.parse(usergroupData);
      let replacement;
      if (parseData) {
        for (const items in parseData) {
          const query = { id: parseData[items]['id'] };
          const isExist = await this.usergroupRepo.findOneBy(query);
          if (!isExist) {
            replacement = await this.usergroupRepo.insert(parseData[items]);
          }
        }
      }

      if (!replacement) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: 'usergroup seeding process is error',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'usergroup seeding has been completed',
      };
    } catch (error) {
      Logger.log(error.message, 'Seeding data is aborting, file is not exists');
      throw error;
    }
  }
}
