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
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  category_id?: number[] | number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  stock_status: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  harga_min: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  harga_max: number;

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

  @IsOptional()
  @IsString()
  order_by: string;

  @IsOptional()
  @IsString()
  orientation: string;
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
