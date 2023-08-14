import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { scopeConfig } from '../../database/entities/appconfig.entities';

export class GetAppconfigID {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class AppconfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  desc: string;

  @IsString()
  @IsNotEmpty()
  scope: scopeConfig;

  @IsObject()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}

export class ListAppconfig {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  scope: scopeConfig;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;

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
