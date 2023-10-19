import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderDocuments } from './order.entities';
import { ProductDocuments } from '../../database/entities/product.entities';

@Entity({ name: 'order_detail' })
export class OrderDetailDocuments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '8', nullable: false })
  kode_transaksi?: string;

  @ManyToOne(() => OrderDocuments, (order) => order.kode_transaksi, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'kode_transaksi',
    referencedColumnName: 'kode_transaksi',
  })
  order?: OrderDocuments;

  @Column({ type: 'int', nullable: false })
  product_id?: number;

  @ManyToOne(() => ProductDocuments, (product) => product.id, {
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
  })
  product?: ProductDocuments;

  @Column({ type: 'int', default: 1 })
  qty: number;

  @Column({ type: 'float', nullable: true })
  harga?: number;

  @Column({ type: 'float', nullable: true })
  total_harga?: number;

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

  constructor(init?: Partial<OrderDetailDocuments>) {
    Object.assign(this, init);
  }
}
