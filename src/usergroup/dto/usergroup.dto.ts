import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UserType } from '../../hash/guard/interface/user.interface';
import { Type } from 'class-transformer';

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

export class ListUsergroup {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  level: string;

  @IsOptional()
  @IsString()
  is_default: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  skip: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}
