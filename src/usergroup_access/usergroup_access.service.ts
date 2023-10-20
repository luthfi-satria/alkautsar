import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessDocument } from '../database/entities/usergroup_access.entity';
import { RSuccessMessage } from '../response/response.interface';
import { ListAccessmenu } from './dto/usergroup_access.dto';
import { UsergroupService } from '../usergroup/usergroup.service';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UsergroupAccessService {
  constructor(
    private readonly responseService: ResponseService,
    @InjectRepository(AccessDocument)
    private readonly accessRepo: Repository<AccessDocument>,
    private readonly usergroupService: UsergroupService,
  ) {}
  private Logger = new Logger(UsergroupAccessService.name);

  async getAll(param: ListAccessmenu) {
    try {
      const limit = param.limit || 10;
      const page = param.page || 1;
      const skip = (page - 1) * limit;

      const filter: any = [];
      if (Object.keys(param).length > 0) {
        for (const items in param) {
          if (['limit', 'page', 'skip'].includes(items) == false) {
            const filterVal = ['LIKE', `'%${param[items]}%'`];
            filter.push(`access_menu.${items} ${filterVal[0]} ${filterVal[1]}`);
          }
        }
      }

      const query = this.accessRepo
        .createQueryBuilder('access_menu')
        .leftJoinAndSelect('access_menu.usergroup', 'group')
        .leftJoinAndSelect('access_menu.menus', 'appmenus');

      if (filter.length > 0) {
        const queryFilter = filter.join(' AND ');
        query.where(queryFilter);
      }

      const [findQuery, count] = await query
        .orderBy('appmenus.level', 'ASC')
        .addOrderBy('appmenus.sequence', 'ASC')
        .skip(skip)
        .limit(limit)
        .getManyAndCount();

      const results: RSuccessMessage = {
        success: true,
        message: 'Get menu access success',
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
      Logger.error(err.message, 'access menu failed to fetch');
      throw err;
    }
  }

  async findOne(search: any) {
    return await this.accessRepo.findOneBy(search);
  }

  async getAccess(user) {
    try {
      const usergroup = await this.usergroupService.findOne({
        id: user.usergroup,
      });
      if (usergroup) {
        const getAccess = await this.accessRepo
          .createQueryBuilder('access_menu')
          .leftJoinAndSelect('access_menu.usergroup', 'group')
          .leftJoinAndSelect('access_menu.menus', 'appmenu')
          .where('group.id = :group_id', { group_id: usergroup.id })
          .orderBy('appmenu.level', 'ASC')
          .addOrderBy('appmenu.sequence', 'ASC')
          .andWhere('appmenu.is_active = :isActive', { isActive: true })
          .getMany();

        if (getAccess) {
          return this.responseService.success(true, 'access menu', getAccess);
        }
      }
      return this.responseService.error(HttpStatus.BAD_REQUEST, {
        value: user.usergroup,
        property: 'access id',
        constraint: ['access menu may not configured'],
      });
    } catch (error) {
      Logger.log(error.message, 'invalid usergroup id');
      throw error;
    }
  }

  async create(body) {
    try {
      const isExists = await this.accessRepo.findOneBy({
        usergroup_id: body.usergroup_id,
        menu_id: body.menu_id,
      });

      if (isExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: body.name,
            property: 'name',
            constraint: ['access menu already configured'],
          },
          'access menu already configured',
        );
      }

      const save = await this.accessRepo
        .save(body)
        .catch((e) => {
          Logger.log(e.message, 'Create access menu');
          throw e;
        })
        .then((e) => {
          return e;
        });

      return this.responseService.success(
        true,
        'Success Create Access Menu!',
        save,
      );
    } catch (err) {
      Logger.error(err.message, 'Create new appmenu');
      throw err;
    }
  }

  async update(id, body) {
    try {
      const isExists = await this.accessRepo.findOneBy({ id: id });

      if (!isExists) {
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: 'id',
            property: 'id',
            constraint: ['Access is not found!'],
          },
          'Access is not found',
        );
      }

      body.usergroup = body.usergroup_id;
      body.menu = body.menu_id;
      delete body.usergroup_id;
      delete body.menu_id;

      const updated = Object.assign(isExists, body);
      const updateAction = await this.accessRepo.update({ id: id }, updated);

      if (updateAction) {
        return this.responseService.success(
          true,
          'Access menu has been updated!',
        );
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Access menu',
          constraint: ['Access menu failed to update!'],
        },
        'Access menu failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Cannot update Access menu');
      throw err;
    }
  }

  async delete(id) {
    try {
      const isExists = await this.accessRepo.findOneBy({ id: id });
      if (!isExists) {
        return this.responseService.error(
          HttpStatus.CONFLICT,
          {
            value: id,
            property: 'id',
            constraint: ['Access menu is not found'],
          },
          'Access menu is not found',
        );
      }

      const deleteAction = await this.accessRepo.softDelete({ id: id });

      if (deleteAction) {
        return this.responseService.success(
          true,
          'Access menu has been updated!',
        );
      }
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Access menu',
          constraint: ['Access menu failed to update!'],
        },
        'Access menu failed to updated!',
      );
    } catch (err) {
      Logger.log(err.message, 'Delete Access menu');
      throw err;
    }
  }

  async seeding() {
    try {
      const accessData = fs.readFileSync(
        join(process.cwd(), 'src/database/seeds/data/menu_access.data.json'),
        'utf-8',
      );

      const parseData: Partial<AccessDocument> = JSON.parse(accessData);
      let replacement: any;
      if (parseData) {
        for (const items in parseData) {
          const query = { id: parseData[items]['id'] };
          const isExist = await this.accessRepo.findOneBy(query);
          if (!isExist) {
            replacement = await this.accessRepo.insert(parseData[items]);
          }
        }
      }

      if (!replacement) {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: 'Menu access seeding process is error',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Menu access seeding has been completed',
      };
    } catch (error) {
      Logger.log(error.message, 'Seeding data is aborting, file is not exists');
      throw error;
    }
  }
}
