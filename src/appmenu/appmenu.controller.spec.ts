import { Test, TestingModule } from '@nestjs/testing';
import { AppmenuController } from './appmenu.controller';
import { AppmenuService } from './appmenu.service';
import { JwtGuard } from '../hash/guard/jwt/jwt.guard';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';

describe('AppmenuController', () => {
  let appmenuController: AppmenuController;
  const MockAppmenuService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppmenuController],
      providers: [
        {
          provide: AppmenuService,
          useValue: MockAppmenuService,
        },
        {
          provide: JwtGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        ResponseService,
        MessageService,
      ],
    }).compile();

    appmenuController = module.get<AppmenuController>(AppmenuController);
  });

  it('should be defined', () => {
    expect(appmenuController).toBeDefined();
  });
});
