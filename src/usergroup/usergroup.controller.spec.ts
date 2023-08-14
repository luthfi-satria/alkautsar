import { Test, TestingModule } from '@nestjs/testing';
import { UsergroupController } from './usergroup.controller';
import { UsergroupService } from './usergroup.service';
import { JwtGuard } from '../hash/guard/jwt/jwt.guard';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { GetUsergroupID, UsergroupDto } from './dto/usergroup.dto';
import { UsergroupDocument } from '../database/entities/usergroup.entity';

describe('UsergroupController', () => {
  let usergroupController: UsergroupController;
  const MockUsergroupService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsergroupController],
      providers: [
        {
          provide: UsergroupService,
          useValue: MockUsergroupService,
        },
        {
          provide: JwtGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        ResponseService,
        MessageService,
      ],
    }).compile();

    usergroupController = module.get<UsergroupController>(UsergroupController);
  });

  it('should be defined', () => {
    expect(usergroupController).toBeDefined();
  });

  it('create => Should be create new usergroup', async () => {
    const usergroup: UsergroupDto = {
      name: 'group test',
    } as UsergroupDto;

    const usergroupData: Partial<UsergroupDocument> = {
      name: 'group test',
    } as Partial<UsergroupDocument>;

    jest.spyOn(MockUsergroupService, 'create').mockReturnValue(usergroupData);
    const result = await usergroupController.create(usergroup);
    expect(MockUsergroupService.create).toBeCalled();
    expect(MockUsergroupService.create).toBeCalledWith(usergroup);
    expect(result).toEqual(usergroup);
  });

  it('update => usergroup should be successfully updated', async () => {
    const id = {
      id: 1,
    } as GetUsergroupID;

    const usergroup: UsergroupDto = {
      name: 'group test 2',
    } as UsergroupDto;

    const usergroupData: Partial<UsergroupDocument> = {
      name: 'group test 2',
    } as Partial<UsergroupDocument>;

    jest.spyOn(MockUsergroupService, 'update').mockReturnValue(usergroupData);
    const result = await usergroupController.update(id, usergroup);
    expect(MockUsergroupService.update).toBeCalled();
    expect(MockUsergroupService.update).toBeCalledWith(id.id, usergroup);
    expect(result).toEqual(usergroupData);
  });

  it('delete => usergroup should be successfully deleted', async () => {
    const id = {
      id: 1,
    } as GetUsergroupID;

    const response = {
      id: 1,
    };
    jest.spyOn(MockUsergroupService, 'delete').mockReturnValue(response);
    const result = await usergroupController.delete(id);

    expect(MockUsergroupService.delete).toBeCalled();
    expect(MockUsergroupService.delete).toBeCalledWith(id.id);
    expect(result).toEqual(response);
  });
});
