import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Education,
  Gender,
  MaritalStatus,
} from '../../hash/guard/interface/user.interface';
import { UserDocuments } from './users.entity';
import { PekerjaanDocument } from './pekerjaan.entities';
import { PerekomendasiDocument } from './perekomendasi.entities';

@Entity({ name: 'users_profile' })
export class UserProfileDocuments {
  @PrimaryGeneratedColumn()
  user_id: number;

  @OneToOne(() => UserDocuments)
  @JoinColumn({ name: 'user_id' })
  login_account: UserDocuments;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  photo?: string;

  @Column({ type: 'text', nullable: true, select: false })
  background_picture?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ktp?: string;

  @Column({ type: 'date', nullable: true })
  masa_berlaku?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dob_place?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'enum', enum: Gender, default: Gender.Male })
  gender?: Gender;

  @Column({ type: 'enum', enum: Education, default: Education.Empty })
  education?: Education;

  @Column({ type: 'enum', enum: MaritalStatus, default: MaritalStatus.SINGLE })
  marital_status?: MaritalStatus;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alamat?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  kelurahan?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  kecamatan?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kota?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status_kepemilikan?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verify_at?: Date | string | null;

  @CreateDateColumn({
    type: 'timestamp',
    select: false,
  })
  created_at?: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  updated_at?: Date | string;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  deleted_at?: Date | string;

  @OneToOne(() => PekerjaanDocument, (pekerjaan) => pekerjaan.profile)
  pekerjaan?: PekerjaanDocument;

  @OneToOne(() => PerekomendasiDocument, (rekomendasi) => rekomendasi.profile)
  rekomendasi?: PerekomendasiDocument;

  constructor(init?: Partial<UserProfileDocuments>) {
    Object.assign(this, init);
  }
}
