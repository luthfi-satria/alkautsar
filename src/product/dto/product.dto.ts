import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListProductDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  kode_produk: string;

  @IsOptional()
  @IsString()
  includeDeleted?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  stock_status: string;

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

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  kode_produk: string;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  harga_beli?: number;

  @IsNotEmpty()
  @IsNumber()
  harga_jual: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  status: number;

  @IsNotEmpty()
  @IsNumber()
  stok: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  min_stok: number;
}

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  kode_produk: string;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  harga_beli?: number;

  @IsNotEmpty()
  @IsNumber()
  harga_jual: number;

  @IsNotEmpty()
  @IsNumber()
  status: number;

  @IsNotEmpty()
  @IsNumber()
  stok: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  min_stok: number;
}

export class ProductIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
