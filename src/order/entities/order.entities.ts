import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfileDocuments } from '../../database/entities/profile.entities';
import { PaymentMethod, StatusOrder } from '../interface/order.interface';
import { OrderDetailDocuments } from './order.details.entities';

@Entity({ name: 'order' })
@Index('order_idx_group_1', [
  'user_id',
  'status',
  'payment_method',
  'payment_date',
  'deleted_at',
])
@Index('order_idx_group_2', [
  'user_id',
  'status',
  'payment_method',
  'deleted_at',
])
@Index('order_idx_group_3', ['user_id', 'status', 'deleted_at'])
@Index('order_idx_group_4', ['user_id', 'deleted_at'])
@Index('order_idx_group_5', [
  'status',
  'payment_method',
  'payment_date',
  'deleted_at',
])
@Index('order_idx_group_6', ['payment_method', 'payment_date', 'deleted_at'])
@Index('order_idx_group_7', ['payment_date', 'deleted_at'])
@Index('order_idx_group_8', ['status', 'payment_date', 'deleted_at'])
@Index('order_idx_group_9', ['status', 'deleted_at'])
export class OrderDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @ManyToOne(() => UserProfileDocuments, (profile) => profile.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserProfileDocuments;

  @Column({ type: 'varchar', unique: true, length: '8', nullable: false })
  kode_transaksi: string;

  @Column({ type: 'int', default: 0 })
  total_item?: number;

  @Column({ type: 'float', default: 0 })
  grand_total?: number;

  @Column({ type: 'enum', enum: StatusOrder, default: StatusOrder.waiting })
  status?: StatusOrder;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.cash })
  payment_method?: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  bank_name?: string;

  @Column({ type: 'date', nullable: true })
  payment_date?: Date;

  @Column({ type: 'varchar', nullable: true })
  ref_no?: string;

  @Column({ nullable: true })
  bukti_transaksi?: string;

  @Column({ type: 'int', nullable: true })
  verificator_id?: number;

  @ManyToOne(() => UserProfileDocuments, (verificator) => verificator.user_id, {
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'verificator_id' })
  verificator?: UserProfileDocuments;

  @Column({ nullable: true, type: 'date' })
  verified_at?: Date;

  @Column({ nullable: true, type: 'date' })
  canceled_at?: Date;

  @CreateDateColumn({
    type: 'timestamp',
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

  @OneToMany(() => OrderDetailDocuments, (details) => details.order)
  details: OrderDetailDocuments[];

  constructor(init?: Partial<OrderDocuments>) {
    Object.assign(this, init);
  }
}
