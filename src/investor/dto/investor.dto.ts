import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListInvestorDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  ktp: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  bank: string;

  @IsOptional()
  @IsString()
  no_investasi: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nilai: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  jangka_waktu: number;

  @IsOptional()
  @IsString()
  tanggal_investasi: string;

  @IsOptional()
  @IsString()
  tanggal_kadaluarsa: string;

  @IsOptional()
  @IsString()
  is_verified: string;

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

export class CreateInvestorDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  no_investasi: string;

  @IsNotEmpty()
  @IsNumber()
  nilai: number;

  @IsNotEmpty()
  @IsNumber()
  jangka_waktu: number;

  @IsOptional()
  @IsString()
  no_rekening: string;

  @IsOptional()
  @IsString()
  bank: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}

export class UpdateInvestorDto {
  @IsNotEmpty()
  @IsString()
  no_investasi: string;

  @IsNotEmpty()
  @IsNumber()
  nilai?: number;

  @IsNotEmpty()
  @IsNumber()
  jangka_waktu?: number;

  @IsOptional()
  @IsString()
  no_rekening?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}

export class InvestorIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
