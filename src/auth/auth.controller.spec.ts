import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../message/message.service';
import { ResponseService } from '../response/response.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    createAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        ResponseService,
        MessageService,
      ],
    }).compile();
    authController = module.get<AuthController>(AuthController);
  });

  it('controller should be defined', () => {
    expect(authController).toBeDefined();
  });

  // UNIT TEST - LOGIN
  it('login => user login should be passed', async () => {
    const loginData = {
      email: 'test@email.com',
      password: '12345678',
    };

    const jwtResponse = {
      success: true,
      message: 'Token successfully generated',
      data: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5zIiwidXNlcl90eXBlIjoiYWRtaW4iLCJsZXZlbCI6ImZyZWUiLCJpYXQiOjE2ODU0MjQxOTIsImV4cCI6MTY4NjAyODk5Mn0.pA98NyIUNhqOb8NZvsayMT3QpZUOfKS6Np33OrM4Xus',
      },
    };

    jest
      .spyOn(mockAuthService, 'createAccessToken')
      .mockReturnValue(jwtResponse);

    const result = await authController.login(loginData);

    expect(result).toHaveProperty('data.token');
    expect(mockAuthService.createAccessToken).toBeCalled();
    expect(mockAuthService.createAccessToken).toBeCalledWith(
      loginData.email,
      loginData.password,
    );
  });
});
