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

import { UserProfileDocuments } from './profile.entities';

@Entity({ name: 'perekomendasi' })
export class PerekomendasiDocument {
  @PrimaryGeneratedColumn()
  user_id: number;

  @OneToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  profile: UserProfileDocuments;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  perekomendasi?: string;

  @Column({ type: 'varchar', length: 50 })
  relasi?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alamat?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kelurahan?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kecamatan?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
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
