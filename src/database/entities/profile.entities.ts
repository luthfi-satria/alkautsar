import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Education,
  Gender,
  MaritalStatus,
} from '../../hash/guard/interface/user.interface';
import { UserDocuments } from './users.entity';

@Entity({ name: 'users_profile' })
export class UserProfileDocuments {
  @PrimaryColumn({ primary: true })
  user_id: number;

  @OneToOne(() => UserDocuments, (login_account) => login_account.profile, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  login_account: UserDocuments;

  @Column({ nullable: true })
  name?: string;

  @Column()
  email?: string;

  @Column()
  phone?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ nullable: true, select: false })
  background_picture?: string;

  @Column({ nullable: true })
  ktp?: string;

  @Column({ type: 'date', nullable: true })
  masa_berlaku?: Date;

  @Column({ nullable: true })
  dob_place?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'enum', enum: Gender, default: Gender.Male })
  gender?: Gender;

  @Column({ type: 'enum', enum: Education, default: Education.Empty })
  education?: Education;

  @Column({ type: 'enum', enum: MaritalStatus, default: MaritalStatus.SINGLE })
  marital_status?: MaritalStatus;

  @Column({ nullable: true })
  alamat?: string;

  @Column({ nullable: true })
  kelurahan?: string;

  @Column({ nullable: true })
  kecamatan?: string;

  @Column({ nullable: true })
  kota?: string;

  @Column({ nullable: true })
  status_kepemilikan?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  verify_at?: Date | string;

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

  constructor(init?: Partial<UserProfileDocuments>) {
    Object.assign(this, init);
  }
}
