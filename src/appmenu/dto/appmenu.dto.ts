import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
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

  @IsOptional()
  @IsNumber()
  @ValidateIf((object) => (object.parent_id == null ? 0 : object.parent_id))
  parent_id?: number;

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

  @IsOptional()
  @ValidateIf((object) => (object.parent_id == null ? 0 : object.parent_id))
  @IsNumber()
  parent_id: number | null;

  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

export class GetAppmenuID {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ListAppmenu {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  level: number;

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
