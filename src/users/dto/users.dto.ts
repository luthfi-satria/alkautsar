import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import { Gender, UserType } from '../../hash/guard/interface/user.interface';
import { Type } from 'class-transformer';
import { number } from 'yargs';

export class GetUserDetail {
  @IsNotEmpty()
  @Type(() => number)
  id: string;
}
export class CreateUsersDto {
  @IsNotEmpty()
  @IsString()
  // @ValidateIf((o) => o.email !== '')
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsNumberString()
  @Length(10, 15)
  phone: string;

  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  usergroup_id: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  usergroup_id: string;

  @IsOptional()
  @IsString()
  password: string;
}

export class ListUser {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  user_type: string;

  @IsOptional()
  @IsString()
  usergroup_id: string;

  @IsOptional()
  @IsString()
  gender: Gender;

  @IsOptional()
  @IsString()
  status: string;

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
