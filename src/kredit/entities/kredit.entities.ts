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

import { UserProfileDocuments } from '../../database/entities/profile.entities';
import { StatusKredit } from '../interface/kredit_status.interface';
import { KreditSupportDocument } from './kredit_support.entities';

@Entity({ name: 'kredit' })
export class KreditDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: '20', nullable: false })
  kredit_code: string;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  profile: UserProfileDocuments;

  @Column({ type: 'date', nullable: true })
  tanggal_pengajuan?: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_approval?: Date;

  @Column({ type: 'date', nullable: true })
  tanggal_akad?: Date;

  @Column({ type: 'int', default: 1 })
  tanggal_jatuh_tempo?: number;

  @Column({ type: 'enum', enum: StatusKredit, default: StatusKredit.waiting })
  status?: StatusKredit;

  @Column({ length: '10', nullable: true })
  jenis_pembiayaan: string;

  @Column({ length: '200', nullable: true })
  nama_produk: string;

  @Column({ length: '200', nullable: true })
  jenis_produk: string;

  @Column({ length: '200', nullable: true })
  tipe_produk: string;

  @Column({ length: '200', nullable: true })
  ukuran_produk: string;

  @Column({ length: '200', nullable: true })
  warna_produk: string;

  @Column({ nullable: true })
  spesifikasi: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  tenor?: number;

  @Column({ type: 'float', nullable: true })
  harga_produk?: number;

  @Column({ type: 'float', nullable: true })
  dp?: number;

  @Column({ type: 'float', nullable: true })
  cicilan?: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verify_at?: Date | string;

  @Column({ type: 'date', nullable: true })
  last_payment?: Date;

  @Column({ nullable: true })
  verificator_id: number;

  @ManyToOne(() => UserProfileDocuments, (verificator) => verificator.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'verificator_id' })
  verificator: UserProfileDocuments;

  @Column({ nullable: true })
  approver_id: number;

  @ManyToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'approver_id' })
  approver: UserProfileDocuments;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  rejected_at?: Date | string;

  @Column({ nullable: true })
  notes?: string;

  @OneToOne(() => KreditSupportDocument, (doc) => doc.kredit)
  document?: KreditSupportDocument;

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

  constructor(init?: Partial<KreditDocument>) {
    Object.assign(this, init);
  }
}
