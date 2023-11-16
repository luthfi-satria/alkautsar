import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UsergroupAccessDto {
  @IsNumber()
  @IsNotEmpty()
  usergroup_id: number;

  @IsNumber()
  @IsNotEmpty()
  menu_id: number;

  @IsArray()
  @IsNotEmpty()
  permissions: string[];
}

export class GetUsergroupAccessID {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: string;
}

export class ListAccessmenu {
  @IsOptional()
  @IsString()
  usergroup: string;

  @IsOptional()
  @IsString()
  menu: string;

  @IsOptional()
  @IsString()
  group_level: string;

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

  @IsOptional()
  @IsString()
  order_by: string;

  @IsOptional()
  @IsString()
  orientation: string;
}
