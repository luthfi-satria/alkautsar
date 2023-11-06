import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  KreditPaymentMethod,
  StatusKredit,
} from '../interface/kredit_status.interface';

export class KreditListDto {
  @IsOptional()
  @IsString()
  kredit_code: string;

  @IsOptional()
  @IsString()
  profile_name: string;

  @IsOptional()
  @IsString()
  profile_phone: string;

  @IsOptional()
  @IsEnum(StatusKredit)
  @ValidateIf((val) => val == '')
  status: StatusKredit;

  @IsOptional()
  @IsString()
  jenis_pembiayaan: string;

  @IsOptional()
  @IsString()
  nama_produk: string;

  @IsOptional()
  @IsString()
  tanggal_pengajuan: string;

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

export class CreateKredit {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  jenis_pembiayaan: string;

  @IsNotEmpty()
  @IsString()
  nama_produk: string;

  @IsOptional()
  @IsString()
  jenis_produk: string;

  @IsOptional()
  @IsString()
  tipe_produk: string;

  @IsOptional()
  @IsString()
  ukuran_produk: string;

  @IsOptional()
  @IsString()
  warna_produk: string;

  @IsOptional()
  @IsString()
  spesifikasi: string;

  @IsNotEmpty()
  @IsString()
  tenor: string;

  @IsNotEmpty()
  @IsString()
  harga_produk: string;

  @IsNotEmpty()
  @IsString()
  dp: string;

  @IsNotEmpty()
  @IsString()
  cicilan: string;

  @IsOptional()
  @IsString()
  tanggal_akad: string;

  @IsOptional()
  @IsString()
  tanggal_jatuh_tempo: string;

  @IsOptional()
  @IsString()
  fc_ktp: string;

  @IsOptional()
  @IsString()
  fc_kk: string;

  @IsOptional()
  @IsString()
  slip_gaji: string;

  @IsOptional()
  @IsString()
  rek_koran: string;

  @IsOptional()
  @IsString()
  surat_pernyataan: string;

  @IsOptional()
  @IsString()
  down_payment: string;

  @IsOptional()
  @IsString()
  notes: string;
}

export class UpdateKredit {
  @IsNotEmpty()
  @IsString()
  kredit_code: string;

  @IsNotEmpty()
  @IsEnum(StatusKredit)
  status: StatusKredit;
}

export class ChangeStatusDto {
  @IsNotEmpty()
  @IsString()
  kredit_code: string;

  @IsNotEmpty()
  @IsEnum(StatusKredit)
  status: StatusKredit;
}

export class BayarKreditDto {
  @IsNotEmpty()
  @IsString()
  kredit_code: string;

  @IsNotEmpty()
  @IsString()
  jml_bayar: string;

  @IsNotEmpty()
  @IsEnum(KreditPaymentMethod)
  payment_method: KreditPaymentMethod;

  @IsOptional()
  @IsString()
  bank_name: string;

  @IsOptional()
  @IsString()
  nomor_rekening: string;

  @IsOptional()
  @IsString()
  pemilik_rekening: string;

  @IsOptional()
  @IsString()
  rekening_tujuan: string;

  @IsOptional()
  @IsString()
  no_referensi: string;

  @IsNotEmpty()
  @IsString()
  payment_date: string;

  @IsOptional()
  @IsString()
  bukti_payment: string;
}

export class KreditHistoryListDto {
  @IsOptional()
  @IsString()
  kredit_code: string;

  @IsOptional()
  @IsString()
  profile_name: string;

  @IsOptional()
  @IsString()
  profile_phone: string;

  @IsOptional()
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsString()
  payment_date: string;

  @IsOptional()
  @IsString()
  verify_at: string;

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
