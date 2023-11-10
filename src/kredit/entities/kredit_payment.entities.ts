import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserProfileDocuments } from '../../database/entities/profile.entities';
import { KreditPaymentMethod } from '../interface/kredit_status.interface';
import { KreditDocument } from './kredit.entities';

@Entity({ name: 'kredit_payment' })
export class KreditPaymentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '20', nullable: false })
  kredit_code: string;

  @ManyToOne(() => KreditDocument, (kredit) => kredit.kredit_code, {
    cascade: true,
  })
  @JoinColumn({ name: 'kredit_code', referencedColumnName: 'kredit_code' })
  kredit: KreditDocument;

  @Column({ type: 'float', nullable: true })
  jml_bayar: number;

  @Column({
    type: 'enum',
    enum: KreditPaymentMethod,
    default: KreditPaymentMethod.CASH,
  })
  payment_method: KreditPaymentMethod;

  @Column({ length: '200', nullable: true })
  bank_name: string;

  @Column({ length: '200', nullable: true })
  nomor_rekening: string;

  @Column({ length: '200', nullable: true })
  pemilik_rekening: string;

  @Column({ length: '200', nullable: true })
  rekening_tujuan: string;

  @Column({ length: '200', nullable: true })
  no_referensi: string;

  @Column({ nullable: true })
  payment_date: string;

  @Column({ nullable: true })
  bukti_payment: string;

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
  @JoinColumn({ name: 'verificator_id', referencedColumnName: 'user_id' })
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

  constructor(init?: Partial<KreditPaymentDocument>) {
    Object.assign(this, init);
  }
}
