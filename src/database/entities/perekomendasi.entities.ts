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

import { UserDocuments } from './users.entity';

@Entity({ name: 'perekomendasi' })
export class PerekomendasiDocument {
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
  perekomendasi?: string;

  @Column()
  relasi?: string;

  @Column({ nullable: true })
  alamat?: string;

  @Column({ nullable: true })
  kelurahan?: string;

  @Column({ nullable: true })
  kecamatan?: string;

  @Column({ nullable: true })
  kota?: string;

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

  constructor(init?: Partial<PerekomendasiDocument>) {
    Object.assign(this, init);
  }
}
