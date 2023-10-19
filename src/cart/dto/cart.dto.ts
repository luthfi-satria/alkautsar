import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CartListDto {
  @IsOptional()
  @IsNumber({}, { each: true })
  cart_ids: number[];

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

export class CreateCartDto {
  // @IsNotEmpty()
  // @IsNumber()
  // user_id: number;

  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdateCartDto {
  // @IsNotEmpty()
  // @IsNumber()
  // user_id: number;

  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class CartIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
