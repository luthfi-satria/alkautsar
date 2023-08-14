import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from '../response/response.service';
import * as fs from 'fs';
import { join } from 'path';
import { AppmenusDocument } from '../database/entities/menus.entity';
import { AppmenuDto, ListAppmenu, UpdateAppmenuDto } from './dto/appmenu.dto';
import { RSuccessMessage } from '../response/response.interface';
import { Repository } from 'typeorm';

@Injectable()
export class AppmenuService {
  constructor(
    @InjectRepository(AppmenusDocument)
    private readonly appmenuRepo: Repository<AppmenusDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async getAll(param: ListAppmenu) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;

      const [findQuery, count] = await this.appmenuRepo
        .createQueryBuilder()
        .skip(skip)
        .limit(limit)
        .getManyAndCount();

      const results: RSuccessMessage = {
        success: true,
        message: 'Get List application menu success',
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
      Logger.error(err.message, 'application configs failed to fetch');
      throw err;
    }
  }

  async findOne(search: any) {
    return await this.appmenuRepo.findOne(search);
  }

  async getDetailMenu(id) {
    const getConfig = await this.findOne({ id: id });
    if (getConfig) {
      return this.responseService.success(true, 'application menu', getConfig);
    }
    return this.responseService.error(HttpStatus.BAD_REQUEST, {
      value: id,
      property: 'menu id',
      constraint: ['menu is not found'],
    });
  }

  async create(body: AppmenuDto) {
    try {
      const isExists = await this.appmenuRepo.findOne({
        where: {
          name: body.name,
        },
      });

      if (isExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: body.name,
            property: 'name',
            constraint: ['Appmenu name already registered!'],
          },
          'Appmenu name Already Exists',
        );
      }

      const save = await this.appmenuRepo
        .save(body)
        .catch((e) => {
          Logger.log(e.message, 'Create appmenu');
          throw e;
        })
        .then((e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Success Create appmenu!',
        save,
      );
    } catch (err) {
      Logger.error(err.message, 'Create new appmenu');
      throw err;
    }
  }

  async update(id, body: UpdateAppmenuDto) {
    try {
      const isExists = await this.appmenuRepo.findOneBy({ id: id });

      if (!isExists) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: 'id',
            property: 'id',
            constraint: ['Appmenu is not found!'],
          },
          'Appmenu is not found',
        );
      }

      const updated = Object.assign(isExists, body);
      const updateAction = await this.appmenuRepo.save(updated);

      if (updateAction) {
        return this.responseService.success(true, 'Appmenu has been updated!');
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Appmenu',
          constraint: ['Appmenu failed to update!'],
        },
        'Appmenu failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Cannot update Appmenu');
      throw err;
    }
  }

  async delete(id) {
    try {
      const isExists = await this.appmenuRepo.findOneBy({ id: id });
      if (!isExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: id,
            property: 'id',
            constraint: ['Appmenu is not found'],
          },
          'Appmenu is not found',
        );
      }

      const deleteAction = await this.appmenuRepo.softDelete({ id: id });

      if (deleteAction) {
        return this.responseService.success(true, 'Appmenu has been updated!');
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Appmenu',
          constraint: ['Appmenu failed to update!'],
        },
        'Appmenu failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Delete Appmenu');
      throw err;
    }
  }

  async seeding() {
    try {
      const AppmenuData = fs.readFileSync(
        join(process.cwd(), 'src/database/seeds/data/appmenu.data.json'),
        'utf-8',
      );

      const parseData = JSON.parse(AppmenuData);
      let replacement;
      if (parseData) {
        for (const items in parseData) {
          const query = { name: parseData[items]['name'] };
          const exist = await this.appmenuRepo.findOne({ where: query });
          if (!exist) {
            replacement = await this.appmenuRepo.save(parseData[items]);
          }
        }
      }

      if (!replacement) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: 'Appmenu seeding process is error',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Appmenu seeding has been completed',
      };
    } catch (error) {
      Logger.log(error.message, 'Seeding data is aborting, file is not exists');
      throw error;
    }
  }
}
