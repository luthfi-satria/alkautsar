import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaymentMethod, StatusOrder } from '../interface/order.interface';
import { Type } from 'class-transformer';

export class OrderListDto {
  @IsOptional()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  kode_transaksi: string;

  @IsOptional()
  @IsEnum(StatusOrder)
  @ValidateIf((val) => val == '')
  status: StatusOrder;

  @IsOptional()
  @IsEnum(PaymentMethod)
  @ValidateIf((val) => val == '')
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  bank_name: string;

  @IsOptional()
  @IsString()
  ref_no: string;

  @IsOptional()
  @IsString()
  date_start: string;

  @IsOptional()
  @IsString()
  date_end: string;

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

export class CreateOrder {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  cart_ids: number[];
}

export class UpdateOrder {
  @IsNotEmpty()
  @IsString()
  kode_transaksi: string;

  @IsOptional()
  @IsEnum(StatusOrder)
  @ValidateIf((val) => val == '')
  status: StatusOrder;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  bank_name: string;

  @IsOptional()
  @IsString()
  ref_no: string;

  @IsOptional()
  @IsString()
  payment_date: string;

  @IsOptional()
  @IsString()
  bukti_transaksi: string;
}
