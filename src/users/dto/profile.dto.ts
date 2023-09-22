import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Education,
  Gender,
  MaritalStatus,
} from '../../hash/guard/interface/user.interface';

export class updateProfileDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  ktp?: string;

  @IsNotEmpty()
  @IsString()
  masa_berlaku?: Date;

  @IsNotEmpty()
  @IsString()
  dob_place?: string;

  @IsNotEmpty()
  @IsString()
  dob?: Date;

  @IsNotEmpty()
  @IsString()
  gender?: Gender;

  @IsNotEmpty()
  @IsString()
  education?: Education;

  @IsNotEmpty()
  @IsString()
  marital_status?: MaritalStatus;

  @IsNotEmpty()
  @IsString()
  alamat?: string;

  @IsNotEmpty()
  @IsString()
  kelurahan?: string;

  @IsNotEmpty()
  @IsString()
  kecamatan?: string;

  @IsNotEmpty()
  @IsString()
  kota?: string;

  @IsNotEmpty()
  @IsString()
  status_kepemilikan?: string;

  @IsOptional()
  @IsString()
  verify_at?: string | undefined | null;
}

export class updateRekomendasiDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  perekomendasi: string;

  @IsNotEmpty()
  @IsString()
  relasi: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;

  @IsNotEmpty()
  @IsString()
  kelurahan: string;

  @IsNotEmpty()
  @IsString()
  kecamatan: string;

  @IsNotEmpty()
  @IsString()
  kota: string;
}

export class updatePekerjaanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  penghasilan: number;

  @IsNotEmpty()
  @IsString()
  tipe_penghasilan: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;

  @IsNotEmpty()
  @IsString()
  kelurahan: string;

  @IsNotEmpty()
  @IsString()
  kecamatan: string;

  @IsNotEmpty()
  @IsString()
  kota: string;

  @IsOptional()
  @IsNumber()
  cicilan: number;
}
