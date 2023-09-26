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

@Entity({ name: 'investor' })
export class InvestorDocuments {
  @PrimaryGeneratedColumn()
  user_id: number;

  @OneToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  profile: UserProfileDocuments;

  @Column({ type: 'float', default: 0 })
  nilai?: number;

  @Column()
  jangka_waktu?: number;

  @Column()
  no_rekening?: string;

  @Column()
  bank?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  tanggal_investasi?: Date | string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  tanggal_kadaluarsa?: Date | string | null;

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

  constructor(init?: Partial<InvestorDocuments>) {
    Object.assign(this, init);
  }
}
