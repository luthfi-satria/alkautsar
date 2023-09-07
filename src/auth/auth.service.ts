import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { HashService } from '../hash/hash.service';
import { UsersService } from '../users/users.service';
import { ResponseService } from '../response/response.service';
import { RMessage } from '../response/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly userService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  async createAccessToken(email, password): Promise<string> {
    const user = await this.userService.findOne('profile.email = :email', {
      email: email,
    });
    let validate = false;

    if (!user) {
      const errors: RMessage = {
        value: email,
        property: 'email',
        constraint: ['Email is not found'],
      };
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        ),
      );
    }

    validate = await this.validatePassword(password, user.password);

    if (!validate) {
      const errors: RMessage = {
        value: password,
        property: 'password',
        constraint: ['Invalid user accounts'],
      };
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        ),
      );
    }

    if (user && validate) {
      const payload = {
        id: user.id,
        username: user.username,
        profile: user.profile,
        user_type: user.user_type,
        usergroup: user.usergroup_id,
      };

      return this.hashService.jwtSign(
        payload,
        `${process.env.AUTH_JWTEXPIRATIONTIME}`,
      );
    }

    return '';
  }

  async validateAccessToken(token: string): Promise<Record<string, any>> {
    return this.hashService.jwtPayload(token);
  }

  async validatePassword(
    passwordString: string,
    passwordHash: string | undefined,
  ): Promise<boolean> {
    passwordHash = passwordHash ? passwordHash : '';
    return this.bcryptComparePassword(passwordString, passwordHash);
  }

  async bcryptComparePassword(
    passwordString: string,
    passwordHashed: string,
  ): Promise<boolean> {
    return compare(passwordString, passwordHashed);
  }
}
