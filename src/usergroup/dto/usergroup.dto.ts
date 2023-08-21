import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '../../hash/guard/interface/user.interface';

export class UsergroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  level: UserType;

  @IsBoolean()
  is_default: boolean;
}

export class GetUsergroupID {
  @IsNotEmpty()
  @IsString()
  id: string;
}
