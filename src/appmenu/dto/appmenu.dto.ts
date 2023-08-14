import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AppmenuDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  api_url: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;

  @IsNotEmpty()
  @IsNumber()
  parent_id: number;

  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

export class UpdateAppmenuDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  api_url: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;

  @IsNotEmpty()
  @IsString()
  parent_id: string;

  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

export class GetAppmenuID {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class ListAppmenu extends AppmenuDto {
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
