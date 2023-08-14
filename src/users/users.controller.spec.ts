import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ResponseService } from '../response/response.service';
import { MessageService } from '../message/message.service';
import { CreateUsersDto, GetUserDetail, UpdateUserDto } from './dto/users.dto';
import { UserDocuments } from '../database/entities/users.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserType } from '../hash/guard/interface/user.interface';
import { JwtGuard } from '../hash/guard/jwt/jwt.guard';

describe('UsersController', () => {
  let userController: UsersController;
  const mockUsersService = {
    getOne: jest.fn(),
    findAll: jest.fn(),
    register: jest.fn(),
    profile: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        ResponseService,
        MessageService,
      ],
    }).compile();

    userController = module.get<UsersController>(UsersController);
  });

  // UNIT TEST - CONTROLLER EXISTENCE
  it('controller should be defined', () => {
    expect(userController).toBeDefined();
  });

  // UNIT TEST - VALIDATION OF DTO
  it('register validation => user registration should be failed', async () => {
    const createUsersDto: CreateUsersDto = {
      email: '',
      name: '',
      password: '',
      phone: '',
      username: '',
    } as CreateUsersDto;

    const plainUsersDto = plainToInstance(CreateUsersDto, createUsersDto);
    const error = await validate(plainUsersDto);

    expect(error.length).not.toBe(0);
  });

  // UNIT TEST - REGISTRATION USER
  it('register => user should be successfully registered', async () => {
    const createUsersDto: CreateUsersDto = {
      email: 'test@email.com',
      name: 'test name',
      password: 'test password',
      phone: '12345678',
      username: 'test_username',
      user_type: UserType.User,
    } as CreateUsersDto;

    const userData = {
      email: 'test@email.com',
      name: 'test name',
      password: 'test password',
      phone: '12345678',
      username: 'test_username',
      user_type: UserType.User,
    } as Partial<UserDocuments>;

    jest.spyOn(mockUsersService, 'register').mockReturnValue(userData);
    const result = await userController.register(createUsersDto);
    expect(mockUsersService.register).toBeCalled();
    expect(mockUsersService.register).toBeCalledWith(createUsersDto);

    expect(result).toEqual(userData);
  });

  // UNIT TEST - GET USER DETAIL
  it('detail => user detail should be fetch', async () => {
    const user: GetUserDetail = {
      id: 1,
    };
    const userData = {
      id: 1,
      email: 'test@email.com',
      name: 'test name',
      password: 'test password',
      phone: '12345678',
      username: 'test_username',
    } as Partial<UserDocuments>;

    const response = {
      success: true,
      message: 'user profile',
      data: userData,
    };

    jest.spyOn(mockUsersService, 'profile').mockReturnValue(response);
    const result = await userController.profile(user);

    expect(result).toEqual(response);
    expect(mockUsersService.profile).toBeCalled();
    expect(mockUsersService.profile).toBeCalledWith(user.id);
  });

  // UNIT TEST - UPDATE USER DETAIL
  it('update => user profile should be updated', async () => {
    const id = {
      id: 1,
    } as GetUserDetail;

    const updateUserDto = {
      name: 'new test',
      phone: '234567889',
      user_type: UserType.User,
    } as UpdateUserDto;

    const userData = {
      id: 1,
      email: 'newTest@email.com',
      name: 'new test',
      phone: '234567889',
      password: 'test password',
      username: 'test_username',
      user_type: UserType.User,
    } as Partial<UserDocuments>;

    jest.spyOn(mockUsersService, 'update').mockReturnValue(userData);
    const result = await userController.update(id, updateUserDto);

    expect(mockUsersService.update).toBeCalled();
    expect(mockUsersService.update).toBeCalledWith(id.id, updateUserDto);
    expect(result).toEqual(userData);
  });
});
