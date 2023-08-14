import {
  HttpStatus,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { RMessage } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  private LOG_CONTEXT = 'AdminRoleGuard';
  private USER_TYPES_METADATA = 'user_types';
  private USER_TYPES_AND_LEVELS_METADATA = 'user_type_and_levels';

  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    private readonly reflector: Reflector,
  ) {}

  private roleAuthError(value: any, property: any, errorMessage: string) {
    const errors: RMessage = {
      value: value,
      property: property,
      constraint: [errorMessage],
    };
    return this.responseService.error(
      HttpStatus.UNAUTHORIZED,
      errors,
      'Role Unauthorize',
    );
  }

  private isAllowedPermission(
    ctx: ExecutionContext,
    userType: string,
    userLevel: string,
  ): boolean {
    const allowedTypes =
      this.reflector.get<string[]>(
        this.USER_TYPES_METADATA,
        ctx.getHandler(),
      ) || [];

    const allowedTypesAndLevels =
      this.reflector.get<string[]>(
        this.USER_TYPES_AND_LEVELS_METADATA,
        ctx.getHandler(),
      ) || [];

    if (allowedTypes.length == 0 && allowedTypesAndLevels.length == 0) {
      Logger.warn(`Endpoint API is undefined!`, this.LOG_CONTEXT);
      return false;
    }

    let isAllowed = false;

    // allowed types permit all role levels, so no need to check levels.
    if (allowedTypes.length > 0) {
      isAllowed = allowedTypes.includes(userType);

      return isAllowed;
    }

    const curTypeLevel =
      userType === 'user' ? `${userType}.*` : `${userType}.${userLevel}`;

    isAllowed = allowedTypesAndLevels.includes(curTypeLevel);

    return isAllowed;
  }

  async canActivate(_context: ExecutionContext) {
    const _req = _context.switchToHttp().getRequest();
    if (_req.headers && _req.headers.authorization == undefined)
      throw new UnauthorizedException('Missing authorization header');

    const token = _req.headers.authorization;

    try {
      const res = await this.authService.validateAccessToken(token);

      const { user_type, level } = res?.data?.payload;
      const isAllowed = this.isAllowedPermission(_context, user_type, level);
      if (!isAllowed) {
        const currTypeLevel = `${user_type}.${
          level === undefined ? '*' : level
        }`;
        throw new UnauthorizedException(
          this.roleAuthError(
            currTypeLevel,
            'user_type_and_level',
            `Unauthorized Access!`,
          ),
        );
      }

      // pass validated token to controller
      _req.user = Object.assign({}, res.data.payload);

      return true;
    } catch (e) {
      Logger.error('ERROR! Validate Auth StoreGuard: ', e.message);
      throw e;
    }
  }
}
