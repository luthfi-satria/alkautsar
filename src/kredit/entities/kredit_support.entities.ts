import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { KreditDocument } from './kredit.entities';
import { UserProfileDocuments } from '../../database/entities/profile.entities';

@Entity({ name: 'kredit_support' })
export class KreditSupportDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '20', nullable: false })
  kredit_code?: string;

  @OneToOne(() => KreditDocument, (kredit) => kredit.kredit_code, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'kredit_code',
    referencedColumnName: 'kredit_code',
  })
  kredit?: KreditDocument;

  @Column({ type: 'varchar', length: '50', nullable: true })
  fc_ktp?: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  fc_kk?: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  slip_gaji?: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  rek_koran?: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  surat_pernyataan?: string;

  @Column({ type: 'varchar', length: '50', nullable: true })
  down_payment?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  verify_at?: Date | string;

  @Column({ nullable: true })
  verificator_id: number;

  @ManyToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'verificator_id' })
  verificator: UserProfileDocuments;

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

  constructor(init?: Partial<KreditSupportDocument>) {
    Object.assign(this, init);
  }
}
