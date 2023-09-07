import { UsergroupDocument } from '../../../database/entities/usergroup.entity';

export enum UserType {
  Owner = 'owner',
  Organisasi = 'organisasi',
  User = 'public',
}

export interface User {
  id: string;
  user_type: UserType;
  usergroup: UsergroupDocument;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum Education {
  Empty = '',
  SD = 'Sekolah Dasar',
  SLTP = 'Sekolah Lanjutan Tingkat Pertama',
  SLTA = 'Sekolah Lanjutan Tingkat Akhir',
  D3 = 'Diploma 3',
  SARJANA = 'Sarjana',
  MAGISTER = 'Magister',
  DOKTORAL = 'Doktoral',
}

export enum MaritalStatus {
  SINGLE = 'Belum Menikah',
  MARRIED = 'Menikah',
  DIVORCE = 'Bercerai',
}
